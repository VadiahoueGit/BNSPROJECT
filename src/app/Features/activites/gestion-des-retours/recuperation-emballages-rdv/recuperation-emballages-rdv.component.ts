import { Component, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ActiviteService } from '../../../../core/activite.service';
import { ParametreService } from '../../../../core/parametre.service';
import { ConfigService } from '../../../../core/config-service.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LOGO_FALLBACK = '/assets/image/logoBestNegoce.png';

@Component({
  selector: 'app-recuperation-emballages-rdv',
  templateUrl: './recuperation-emballages-rdv.component.html',
  styleUrls: ['./recuperation-emballages-rdv.component.scss']
})
export class RecuperationEmballagesRdvComponent {
  @ViewChild('dt2') dt2!: Table;
  dataList: any[] = [];
  totalPages: number = 0;
  loading: boolean = true;
  isModalOpen = false;
  updateData: any = {};
  historique: any = null;
  currentPage: number;
  rowsPerPage: any;
  generatingPdf = false;

  constructor(
    private _spinner: NgxSpinnerService,
    private activiteService: ActiviteService,
    private parametreService: ParametreService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetEmballagesRecuperesDepuisRdv(1);
  }

  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  get filteredArticles() {
    return this.updateData.emballagesRecuperes || [];
  }

  OnCloseModal() {
    this.isModalOpen = false;
  }

  OnView(data: any) {
    this.updateData = data;
    this.historique = null;
    this.isModalOpen = true;
    this.activiteService.GetHistoriqueRetourEmballage(data.id).then((res: any) => {
      this.historique = res.data;
    });
  }

  GetEmballagesRecuperesDepuisRdv(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.activiteService.GetEmballagesRecuperesDepuisRdv(data).then((res: any) => {
      this.dataList = res.data || [];
      this.totalPages = res.total;
    }, (error: any) => {
      this.toastr.error('Erreur!', 'Erreur lors de la récupération des emballages issus de RDV.');
      console.error('Erreur lors de la récupération des emballages issus de RDV', error);
    }).finally(() => {
      this.loading = false;
      this._spinner.hide();
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
    this.GetEmballagesRecuperesDepuisRdv(this.currentPage);
  }

  private getLogoUrl(logoPath: string): string {
    if (!logoPath) return '';
    if (logoPath.startsWith('http')) return logoPath;
    const base = (this.configService.docUrl || '').replace(/\/$/, '');
    return base + logoPath;
  }

  private loadImageAsDataUrl(url: string): Promise<string | null> {
    return fetch(url)
      .then(res => { if (!res.ok) throw new Error('logo introuvable'); return res.blob(); })
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .catch(() => null);
  }

  async genererPdf(): Promise<void> {
    if (this.generatingPdf) return;
    this.generatingPdf = true;
    try {
      const entreprise = await this.parametreService.getEntrepriseConfig().catch(() => null);
      const logoUrl = entreprise?.logoPath ? this.getLogoUrl(entreprise.logoPath) : LOGO_FALLBACK;
      const logoDataUrl = await this.loadImageAsDataUrl(logoUrl) || await this.loadImageAsDataUrl(LOGO_FALLBACK);

      this.buildPdf(entreprise, logoDataUrl);
    } finally {
      this.generatingPdf = false;
    }
  }

  private buildPdf(entreprise: any, logoDataUrl: string | null): void {
    const data = this.updateData;
    const hist = this.historique;
    const articles = this.filteredArticles;

    const entrepriseNom = entreprise?.nom || 'BNS GROUPE';

    // ── Données de base
    const retourId = data.id || 0;
    const numBRE = `BRE-${new Date(data.createdAt).getFullYear()}-${String(retourId).padStart(5, '0')}`;
    const numCommande = data.commandeClient?.NumCommande || data.commandeGratuite?.NumCommande || data.venteChine?.numVenteChine || '—';
    const clientNom = data.clientALivrer?.raisonSocial || data.clientALivrer?.nomEtablissement || '—';
    const clientCode = data.clientALivrer?.codeClient || data.clientALivrer?.code || '—';
    const clientTel = data.clientALivrer?.telephoneGerant || data.clientALivrer?.telephoneProprietaire || data.clientALivrer?.telephone || data.clientALivrer?.contactGerant || '—';
    const clientAdresse = data.clientALivrer?.localite?.nom || '—';
    const depot = data.depot?.nomDepot || '—';
    const dateRecup = data.createdAt ? new Date(data.createdAt) : new Date();
    const dateStr = dateRecup.toLocaleDateString('fr-FR');
    const heureStr = dateRecup.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const chauffeur = data.venteChine
      ? `${data.venteChine.commercial?.nom || ''} ${data.venteChine.commercial?.prenoms || ''}`.trim()
      : data.transporteur ? `${data.transporteur.nom || ''} ${data.transporteur.prenoms || ''}`.trim() : '—';
    const vehicule = data.vehicule ? `${data.vehicule.marque || ''} ${data.vehicule.immatriculation || ''}`.trim() : '—';

    const articleRows = (articles || []).map((a: any) => ({
      code: a.produit?.code || a.productCode || '—',
      libelle: a.produit?.libelle || '—',
      unite: a.produit?.condition || 'PCE',
      qteAttendue: a.qteAttendue || 0,
      qteRecuperee: a.quantity || 0,
      solde: a.soldeRestant || 0,
    }));

    const totalAttendu = data.totalAttendu ?? articleRows.reduce((s: number, r: any) => s + r.qteAttendue, 0);
    const totalRecupere = data.totalRecupereCeJour ?? articleRows.reduce((s: number, r: any) => s + r.qteRecuperee, 0);
    const soldeTotal = data.soldeRestantTotal ?? articleRows.reduce((s: number, r: any) => s + r.solde, 0);

    // ── Palette
    const navy: [number, number, number] = [13, 42, 92];
    const green: [number, number, number] = [26, 156, 75];
    const orange: [number, number, number] = [214, 110, 20];
    const grayText: [number, number, number] = [90, 90, 90];

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 10;

    // ── En-tête : logo + titre à gauche, N°/date à droite
    if (logoDataUrl) {
      try { doc.addImage(logoDataUrl, margin, y - 2, 16, 16); } catch { /* image illisible, on ignore */ }
    }
    const titleX = logoDataUrl ? margin + 20 : margin;
    doc.setTextColor(...navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(entrepriseNom.toUpperCase(), titleX, y + 2);
    doc.setFontSize(15);
    doc.text('BON DE RECUPERATION', titleX, y + 9);
    doc.text("D'EMBALLAGES", titleX, y + 15);

    doc.setFillColor(...navy);
    const badgeW = 46, badgeH = 8;
    doc.roundedRect(pageW - margin - badgeW, y - 2, badgeW, badgeH, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° ${numBRE}`, pageW - margin - badgeW / 2, y + 3, { align: 'center' });
    doc.setTextColor(...grayText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Date : ${dateStr}`, pageW - margin, y + 12, { align: 'right' });
    doc.text(`Heure : ${heureStr}`, pageW - margin, y + 16, { align: 'right' });

    y += 22;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    // ── Deux blocs : CLIENT / INFOS RECUPERATION
    const colW = (pageW - margin * 2 - 8) / 2;
    const boxH = 34;
    const drawBoxHeader = (x: number, title: string, color: [number, number, number]) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, colW, boxH, 1.5, 1.5);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(x + 3, y - 3, 32, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(title, x + 3 + 16, y + 1, { align: 'center' });
    };
    const drawField = (x: number, cy: number, label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...grayText);
      doc.setFontSize(8);
      doc.text(label + ' :', x, cy);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      doc.text(value || '—', x, cy + 4.5);
    };

    drawBoxHeader(margin, 'CLIENT', navy);
    drawField(margin + 4, y + 8, 'Nom / Raison sociale', clientNom);
    drawField(margin + 4, y + 17, 'Code client', clientCode);
    drawField(margin + 4, y + 26, 'Telephone', clientTel);

    const col2X = margin + colW + 8;
    drawBoxHeader(col2X, 'INFORMATIONS DE LA RECUPERATION', navy);
    drawField(col2X + 4, y + 8, 'Ref. commande / vente', numCommande);
    drawField(col2X + 4, y + 17, 'Livreur / Agent', chauffeur);
    drawField(col2X + 4, y + 26, 'Depot de rattachement', depot);

    y += boxH + 10;

    // ── Tableau emballages
    doc.setFillColor(230, 240, 255);
    doc.rect(margin, y, pageW - margin * 2, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text('EMBALLAGES RECUPERES', margin + 2, y + 5);
    y += 10;

    const tableRows = articleRows.map((r: any, i: number) => [
      String(i + 1),
      r.libelle,
      r.unite,
      r.qteAttendue > 0 ? String(r.qteAttendue) : '—',
      String(r.qteRecuperee),
      String(r.solde),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['N°', 'Emballage', 'Unite', 'Qte attendue (RDV)', 'Qte recuperee ce jour', 'Solde restant']],
      body: tableRows,
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 251, 255] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 34, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 26, halign: 'center', fontStyle: 'bold', textColor: orange },
      },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
    doc.setFillColor(240, 244, 255);
    doc.rect(margin, y, pageW - margin * 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('TOTAL', margin + 2, y + 5.5);
    doc.text(String(totalAttendu), pageW - margin - 60, y + 5.5, { align: 'center' });
    doc.text(String(totalRecupere), pageW - margin - 26, y + 5.5, { align: 'center' });
    doc.setTextColor(...orange);
    doc.text(String(soldeTotal), pageW - margin - 4, y + 5.5, { align: 'right' });
    y += 14;

    // ── État des emballages récupérés + Récapitulatif (côte à côte)
    if (y > 220) { doc.addPage(); y = 14; }
    const etatW = colW;
    const drawCheckbox = (x: number, cy: number, label: string) => {
      doc.setDrawColor(150, 150, 150);
      doc.rect(x, cy - 3, 3.5, 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(20, 20, 20);
      doc.text(label, x + 6, cy);
    };
    drawBoxHeader(margin, 'ETAT DES EMBALLAGES', [80, 80, 80]);
    drawCheckbox(margin + 4, y + 7, 'Bon etat');
    drawCheckbox(margin + 4, y + 14, 'Casses');
    drawCheckbox(margin + 4, y + 21, 'Manquants');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayText);
    doc.text('Autres observations :', margin + 4, y + 28);
    doc.setDrawColor(210, 210, 210);
    doc.line(margin + 4, y + 31, margin + colW - 4, y + 31);

    // Récapitulatif (3 mini-cartes verticales dans la 2e colonne)
    const recapX = col2X;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...navy);
    doc.text('RECAPITULATIF', recapX, y - 5);
    const miniCards: [string, string, [number, number, number]][] = [
      ['TOTAL ATTENDU (RDV)', `${totalAttendu} emballage(s)`, navy],
      ['TOTAL RECUPERE CE JOUR', `${totalRecupere} emballage(s)`, green],
      ['SOLDE RESTANT', `${soldeTotal} emballage(s)`, orange],
    ];
    miniCards.forEach(([label, val, color], i) => {
      const cy = y + i * 10;
      doc.setFillColor(248, 249, 251);
      doc.rect(recapX, cy, colW, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...grayText);
      doc.text(label, recapX + 2, cy + 3.2);
      doc.setFontSize(8.5);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(val, recapX + 2, cy + 6.8);
    });

    y += 36;

    // ── Historique
    if (hist?.historique?.length) {
      if (y > 220) { doc.addPage(); y = 14; }
      doc.setFillColor(235, 235, 235);
      doc.rect(margin, y, pageW - margin * 2, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text('HISTORIQUE DES RECUPERATIONS', margin + 2, y + 5);
      y += 10;
      const histRows = hist.historique.map((h: any) => [
        new Date(h.date).toLocaleDateString('fr-FR'),
        String(h.qteRecuperee),
        String(h.soldeRestant),
      ]);
      autoTable(doc, {
        startY: y,
        head: [['Date', 'Qte recuperee', 'Solde restant']],
        body: histRows,
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        headStyles: { fillColor: [80, 80, 80], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: orange },
        },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ── Prochain RDV (manuel) + Commentaire (manuel)
    if (y > 210) { doc.addPage(); y = 14; }
    const rdvBoxH = 30;
    drawBoxHeader(margin, 'PROCHAIN RENDEZ-VOUS (SI SOLDE)', [214, 110, 20]);
    drawField(margin + 4, y + 8, 'Prochaine date de recuperation', '___/___/______');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayText);
    doc.text('Creneau horaire :', margin + 4, y + 17);
    drawCheckbox(margin + 40, y + 17, 'Matin');
    drawCheckbox(margin + 65, y + 17, 'Apres-midi');
    drawField(margin + 4, y + 26, 'Lieu de recuperation', '');

    drawBoxHeader(col2X, 'COMMENTAIRE', [80, 80, 80]);
    doc.setDrawColor(210, 210, 210);
    for (let i = 0; i < 3; i++) {
      doc.line(col2X + 4, y + 9 + i * 7, col2X + colW - 4, y + 9 + i * 7);
    }

    y += rdvBoxH + 10;

    // ── Signatures
    if (y > 235) { doc.addPage(); y = 14; }
    const sigW = (pageW - margin * 2 - 10) / 2;
    doc.setFillColor(245, 248, 255);
    doc.rect(margin, y, sigW, 30, 'F');
    doc.rect(margin + sigW + 10, y, sigW, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text('SIGNATURE LIVREUR / AGENT', margin + 2, y + 5);
    doc.text('SIGNATURE CLIENT', margin + sigW + 12, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Nom : ${chauffeur}`, margin + 2, y + 12);
    doc.text('Nom : ___________________________', margin + sigW + 12, y + 12);
    doc.text(`Date : ${dateStr}`, margin + 2, y + 19);
    doc.text('Date : _____ / _____ / _______', margin + sigW + 12, y + 19);
    y += 36;

    // ── Pied de page
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'italic');
    doc.text('En signant ce document, le client reconnait avoir remis les emballages ci-dessus.', pageW / 2, y, { align: 'center' });
    doc.text("Ce document ne vaut pas facture. Seule la facture emise fera foi quant au montant du.", pageW / 2, y + 4, { align: 'center' });

    doc.save(`BRE-RDV-${numCommande}-${dateStr.replace(/\//g, '-')}.pdf`);
  }
}
