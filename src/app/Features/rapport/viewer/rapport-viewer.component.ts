import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgxSpinnerService } from 'ngx-spinner';
import { RapportService } from '../../../core/rapport.service';
import { ColonneConfig, KpiConfig, RAPPORTS, RapportConfig } from '../rapport-config';

@Component({
  selector: 'app-rapport-viewer',
  templateUrl: './rapport-viewer.component.html',
  styleUrls: ['./rapport-viewer.component.scss']
})
export class RapportViewerComponent implements OnInit {

  config: RapportConfig | null = null;
  filtres: Record<string, any> = {};
  data: any[] = [];
  kpiValues: Record<string, number> = {};
  loading = false;
  hasData = false;
  generated = false;
  erreur = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rapportService: RapportService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.config = RAPPORTS.find(r => r.id === id) || null;
    if (this.config) {
      this.initFiltres();
    }
  }

  private initFiltres(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.filtres['dateDebut'] = this.toDateInput(firstDay);
    this.filtres['dateFin']   = this.toDateInput(today);
    this.config!.filtres.forEach(f => {
      if (!(f.key in this.filtres)) {
        this.filtres[f.key] = f.type === 'select' || f.type === 'select-multi' ? null : '';
      }
    });
  }

  private toDateInput(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  // ──────────────────────────────────────────────────────────
  // COLONNES EFFECTIVES (statiques OU dynamiques depuis data)
  // ──────────────────────────────────────────────────────────
  get colonnesEffectives(): ColonneConfig[] {
    if (!this.config?.colonnesDynamiques || !this.data.length) {
      return this.config?.colonnes ?? [];
    }

    const fixed    = this.config.colonnesFixees ?? [];
    const fixedSet = new Set(fixed.map(c => c.key));
    const exclude  = new Set(this.config.colonnesExclure ?? []);

    const dynamiques: ColonneConfig[] = Object.keys(this.data[0])
      .filter(k => !fixedSet.has(k) && !exclude.has(k))
      .map(k => ({
        key:   k,
        label: k.replace(/_/g, ' '),
        type:  'number' as const,
        align: 'right'  as const,
      }));

    return [...fixed, ...dynamiques];
  }

  // ──────────────────────────────────────────────────────────
  // LIGNE TOTAUX
  // ──────────────────────────────────────────────────────────
  get totauxRow(): Record<string, any> | null {
    if (!this.config?.colonnesTotaux || !this.data.length) return null;

    const row: Record<string, any> = {};
    this.colonnesEffectives.forEach((col, i) => {
      if (col.type === 'number' || col.type === 'currency') {
        row[col.key] = this.data.reduce((s, r) => s + (parseFloat(r[col.key]) || 0), 0);
      } else {
        row[col.key] = i === 0 ? 'TOTAL' : '';
      }
    });
    return row;
  }

  // ──────────────────────────────────────────────────────────
  // GÉNÉRATION
  // ──────────────────────────────────────────────────────────
  async generer(): Promise<void> {
    if (!this.config) return;
    this.erreur = '';
    this.loading = true;
    this.spinner.show();
    try {
      const res = await this.rapportService.execProcedure(this.config.procedure, this.filtres);
      this.data = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
      this.hasData = this.data.length > 0;
      this.generated = true;
      this.computeKpis();
    } catch (e: any) {
      this.erreur = e?.error?.message || 'Une erreur est survenue lors de la génération du rapport.';
      this.data = [];
      this.hasData = false;
      this.generated = true;
    } finally {
      this.loading = false;
      this.spinner.hide();
    }
  }

  private computeKpis(): void {
    if (!this.config?.kpis) return;
    this.config.kpis.forEach(kpi => {
      if (kpi.key === '_totalClients') {
        this.kpiValues[kpi.key] = this.data.length;
      } else if (kpi.key === '_totalCommerciaux') {
        this.kpiValues[kpi.key] = new Set(this.data.map((r: any) => r['commercial'])).size;
      } else if (kpi.key === '_totalDepots') {
        this.kpiValues[kpi.key] = new Set(this.data.map((r: any) => r['depot'])).size;
      } else if (kpi.key === '_totalCasiers') {
        // somme de toutes les colonnes numériques dynamiques
        const dynCols = this.colonnesEffectives.filter(c => c.type === 'number');
        this.kpiValues[kpi.key] = this.data.reduce((sum, row) =>
          sum + dynCols.reduce((s, col) => s + (parseFloat(row[col.key]) || 0), 0), 0);
      } else {
        this.kpiValues[kpi.key] = this.data.reduce(
          (s, row) => s + (parseFloat(row[kpi.key]) || 0), 0
        );
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // HELPERS AFFICHAGE
  // ──────────────────────────────────────────────────────────
  getCellValue(row: any, col: ColonneConfig): string {
    const val = row[col.key];
    if (val == null || val === '') return '—';
    if (col.type === 'currency') return Number(val).toLocaleString('fr-FR') + ' XOF';
    if (col.type === 'number')   return Number(val).toLocaleString('fr-FR');
    if (col.type === 'percent')  return Number(val).toFixed(2) + ' %';
    if (col.type === 'date')     return val ? new Date(val).toLocaleDateString('fr-FR') : '—';
    return String(val);
  }

  getBadgeClass(row: any, col: ColonneConfig): string {
    if (!col.badgeMap) return 'info';
    return col.badgeMap[row[col.key]] || 'info';
  }

  formatKpiValue(kpi: KpiConfig): string {
    const v = this.kpiValues[kpi.key] ?? 0;
    if (kpi.type === 'currency') return v.toLocaleString('fr-FR') + ' XOF';
    if (kpi.type === 'number')   return v.toLocaleString('fr-FR');
    return String(v);
  }

  // ──────────────────────────────────────────────────────────
  // EXPORT EXCEL
  // ──────────────────────────────────────────────────────────
  exportExcel(): void {
    if (!this.config || !this.data.length) return;
    const cols = this.colonnesEffectives;
    const rows = this.data.map(row =>
      cols.reduce((obj: any, c) => {
        obj[c.label] = row[c.key] ?? '';
        return obj;
      }, {})
    );

    // Ligne totaux
    if (this.totauxRow) {
      const totalRowXlsx = cols.reduce((obj: any, c) => {
        const v = this.totauxRow![c.key];
        obj[c.label] = v !== '' ? v : '';
        return obj;
      }, {});
      rows.push(totalRowXlsx);
    }

    const ws = XLSX.utils.json_to_sheet(rows, { header: cols.map(c => c.label) });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');

    // Style entête
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '0071C2' } },
          alignment: { horizontal: 'center' }
        };
      }
    }
    // Style ligne totaux
    if (this.totauxRow) {
      const lastRow = range.e.r;
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: lastRow, c: C });
        if (ws[addr]) {
          ws[addr].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'E8F0E2' } }
          };
        }
      }
    }

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `${this.config.titre}_${this.filtres['dateDebut']}_${this.filtres['dateFin']}.xlsx`);
  }

  // ──────────────────────────────────────────────────────────
  // EXPORT PDF
  // ──────────────────────────────────────────────────────────
  exportPdf(): void {
    if (!this.config || !this.data.length) return;
    const cols = this.colonnesEffectives;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // En-tête
    doc.setFillColor(0, 113, 194);
    doc.rect(0, 0, 297, 22, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(this.config.titre, 14, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Période : ${this.filtres['dateDebut']} → ${this.filtres['dateFin']}`, 14, 20);
    const dateGen = `Généré le : ${new Date().toLocaleDateString('fr-FR')}`;
    doc.text(dateGen, 297 - 14 - doc.getTextWidth(dateGen), 20);

    const body = this.data.map(row => cols.map(c => this.getCellValue(row, c)));
    if (this.totauxRow) {
      body.push(cols.map(c => {
        const v = this.totauxRow![c.key];
        if (v === '') return '';
        if (typeof v === 'number') return v.toLocaleString('fr-FR');
        return String(v);
      }));
    }

    autoTable(doc, {
      head: [cols.map(c => c.label)],
      body,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [141, 174, 86], textColor: 255, fontStyle: 'bold', halign: 'center' },
      alternateRowStyles: { fillColor: [247, 252, 255] },
      columnStyles: this.buildPdfColumnStyles(cols),
      margin: { left: 8, right: 8 },
      didParseCell: (data: any) => {
        // Ligne totaux en gras fond vert clair
        if (this.totauxRow && data.row.index === body.length - 1 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [232, 240, 226];
        }
      },
      didDrawPage: (data: any) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber} / ${pageCount}`, 297 - 20, 207);
      }
    });

    doc.save(`${this.config.titre}_${this.filtres['dateDebut']}_${this.filtres['dateFin']}.pdf`);
  }

  private buildPdfColumnStyles(cols: ColonneConfig[]): Record<number, any> {
    const styles: Record<number, any> = {};
    cols.forEach((c, i) => {
      if (c.align === 'right' || c.type === 'currency' || c.type === 'number') {
        styles[i] = { halign: 'right' };
      } else if (c.align === 'center') {
        styles[i] = { halign: 'center' };
      }
    });
    return styles;
  }

  goBack(): void {
    this.router.navigate(['/feature/rapport']);
  }
}
