import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CATEGORIES_RAPPORT, CategorieRapport, RAPPORTS, RapportConfig } from './rapport-config';
import { RapportService } from '../../core/rapport.service';

export interface RapportPerso {
  id: number;
  titre: string;
  sql: string;
  createdAt: string;
}

@Component({
  selector: 'app-rapport',
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.scss']
})
export class RapportComponent implements OnInit {

  // ── catalogue standard ──────────────────────────────────────
  categories = CATEGORIES_RAPPORT;
  recherche = '';

  // ── constructeur ────────────────────────────────────────────
  isModalConstructeur = false;
  cq = { titre: '', sql: '' };
  cqData: any[] = [];
  cqGenerated = false;
  cqLoading = false;
  cqErreur = '';

  // ── rapports personnalisés sauvegardés ───────────────────────
  savedRapports: RapportPerso[] = [];

  constructor(
    private router: Router,
    private rapportService: RapportService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSaved();
  }

  private loadSaved(): void {
    this.rapportService.getPerso().then((res: any) => {
      this.savedRapports = res?.data ?? [];
    }).catch(() => { this.savedRapports = []; });
  }

  // ── catalogue ────────────────────────────────────────────────
  getRapportsParCategorie(categorieId: string): RapportConfig[] {
    return RAPPORTS.filter(r =>
      r.categorie === categorieId &&
      (!this.recherche || r.titre.toLowerCase().includes(this.recherche.toLowerCase()))
    );
  }

  get categoriesVisibles(): CategorieRapport[] {
    if (!this.recherche) return this.categories;
    return this.categories.filter(c => this.getRapportsParCategorie(c.id).length > 0);
  }

  get totalRapports(): number { return RAPPORTS.length; }

  ouvrirRapport(rapport: RapportConfig): void {
    this.router.navigate(['/feature/rapport/viewer', rapport.id]);
  }

  // ── constructeur : colonnes dynamiques ───────────────────────
  get cqColonnes(): string[] {
    if (!this.cqData.length) return [];
    return Object.keys(this.cqData[0]);
  }

  get cqTotaux(): Record<string, any> | null {
    if (!this.cqData.length) return null;
    const row: Record<string, any> = {};
    this.cqColonnes.forEach((k, i) => {
      const allNum = this.cqData.every(r => r[k] !== null && r[k] !== '' && !isNaN(Number(r[k])));
      if (allNum) {
        row[k] = this.cqData.reduce((s, r) => s + (parseFloat(r[k]) || 0), 0);
      } else {
        row[k] = i === 0 ? 'TOTAL' : '';
      }
    });
    return row;
  }

  // ── constructeur : extraire tous les params :xxx de la requête ─
  get cqParams(): string[] {
    const matches = this.cq.sql.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g) ?? [];
    return [...new Set(matches.map(m => m.slice(1)))];
  }

  cqParamValues: Record<string, string> = {};

  async genererCq(): Promise<void> {
    if (!this.cq.sql.trim()) return;
    this.cqErreur = '';
    this.cqLoading = true;
    try {
      const res = await this.rapportService.execQuery(this.cq.sql, this.cqParamValues);
      this.cqData = Array.isArray(res) ? res : (res?.data ?? []);
      this.cqGenerated = true;
    } catch (e: any) {
      this.cqErreur = e?.error?.message || 'Erreur lors de l\'exécution de la requête.';
      this.cqData = [];
      this.cqGenerated = true;
    } finally {
      this.cqLoading = false;
    }
  }

  ouvrirConstructeur(): void {
    this.cqData = [];
    this.cqGenerated = false;
    this.cqErreur = '';
    this.cqParamValues = {};
    this.isModalConstructeur = true;
  }

  fermerConstructeur(): void {
    this.isModalConstructeur = false;
  }

  // ── sauvegarde BDD ───────────────────────────────────────────
  sauvegarderCq(): void {
    if (!this.cq.titre.trim() || !this.cq.sql.trim()) return;
    this.rapportService.savePerso(this.cq.titre.trim(), this.cq.sql).then(() => {
      this.loadSaved();
      this.toastr.success('Rapport sauvegardé avec succès.');
      this.fermerConstructeur();
    }).catch(() => {
      this.toastr.error('Erreur lors de la sauvegarde.');
    });
  }

  chargerRapport(r: RapportPerso): void {
    this.cq = { titre: r.titre, sql: r.sql };
    this.cqData = [];
    this.cqGenerated = false;
    this.cqErreur = '';
    this.cqParamValues = {};
    this.isModalConstructeur = true;
  }

  supprimerRapport(id: number): void {
    this.rapportService.deletePerso(id).then(() => {
      this.savedRapports = this.savedRapports.filter(r => r.id !== id);
    });
  }

  // ── export Excel ─────────────────────────────────────────────
  exportExcelCq(): void {
    if (!this.cqData.length) return;
    const cols = this.cqColonnes;
    const rows = [...this.cqData];
    if (this.cqTotaux) rows.push(this.cqTotaux as any);

    const ws = XLSX.utils.json_to_sheet(rows, { header: cols });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const today = new Date().toISOString().slice(0, 10);
    saveAs(
      new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `${this.cq.titre || 'rapport'}_${today}.xlsx`
    );
  }

  // ── export PDF ───────────────────────────────────────────────
  isNumber(val: any): boolean {
    return val !== null && val !== '' && !isNaN(Number(val));
  }

  exportPdfCq(): void {
    if (!this.cqData.length) return;
    const cols = this.cqColonnes;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFillColor(0, 113, 194);
    doc.rect(0, 0, 297, 22, 'F');
    doc.setFontSize(13); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text(this.cq.titre || 'Rapport personnalisé', 14, 14);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 20);
    const gen = `Généré le : ${new Date().toLocaleDateString('fr-FR')}`;
    doc.text(gen, 297 - 14 - doc.getTextWidth(gen), 20);

    const body = this.cqData.map(row => cols.map(k => row[k] ?? ''));
    if (this.cqTotaux) body.push(cols.map(k => this.cqTotaux![k] ?? ''));

    autoTable(doc, {
      head: [cols],
      body,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 2.5 },
      headStyles: { fillColor: [141, 174, 86], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [247, 252, 255] },
      didParseCell: (data: any) => {
        if (this.cqTotaux && data.row.index === body.length - 1 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [232, 240, 226];
        }
      },
      margin: { left: 8, right: 8 },
    });
    doc.save(`${this.cq.titre || 'rapport'}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
