import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import {MotifRetour} from "../../../../utils/utils";
import {ALERT_QUESTION} from "../../../shared-component/utils";
import {ActiviteService} from "../../../../core/activite.service";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-receptions-emballages',
  templateUrl: './receptions-emballages.component.html',
  styleUrls: ['./receptions-emballages.component.scss']
})
export class ReceptionsEmballagesComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  ArticleForm!:FormGroup
  loading: boolean = true;
  isModalOpen = false;
  totalPages: number = 0;
  nbReceptions: number = 0;
  totalEmballagesRecus: number = 0;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  historique: any = null;
  isEditMode: boolean = false;
  currentPage: number;
  rowsPerPage: any;
  filters: any = {
    statut: '',
    numCommande: '',
    dateDebut: '',
    dateFin: '',
  };
  statutOptions = [
    { label: 'Validé', value: 'Validé' },
    { label: 'En attente', value: 'En attente' },
  ];
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private activiteService:ActiviteService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {

    this.GetRetourEmballageList(1);
  }

  get filteredArticles() {
    return this.updateData.articles?.filter((a:any) => a.prixUnitaire > 0);
  }

  filterList() {
    this.GetRetourEmballageList(1);
  }

  resetFilters() {
    this.filters = { statut: '', numCommande: '', dateDebut: '', dateFin: '' };
    this.GetRetourEmballageList(1);
  }

  clear(table: Table) {
    table.clear();
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    console.log('OnEdit — ouverture détail réception:', data);
    this.isEditMode = true;
    this.updateData = data;
    this.articleId = data.id;
    this.historique = null;
    this.isModalOpen = true;
    this.operation = 'edit';
    this.activiteService.GetHistoriqueRetourEmballage(data.id).then((res: any) => {
      this.historique = res.data;
    });
  }
  getStatutClass(statut: string): string {
    if (!statut) return 'gray';
    const s = statut.toLowerCase();
    if (s.includes('valid')) return 'green';
    if (s.includes('attente')) return 'orange';
    if (s.includes('refus') || s.includes('annul')) return 'red';
    return 'blue';
  }

  OnAnnuler(data: any) {
    ALERT_QUESTION(
      'warning',
      'Attention !',
      "Voulez-vous annuler cette réception ? Les quantités d'emballages seront réaffectées en RDV à la date du jour."
    ).then((res) => {
      if (res.isConfirmed) {
        this._spinner.show();
        this.activiteService.AnnulerRetourEmballage(data.id).then(
          (res: any) => {
            this._spinner.hide();
            this.toastr.success(res.message);
            this.OnCloseModal();
            this.GetRetourEmballageList(1);
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error(error?.error?.message || "Erreur lors de l'annulation.");
          }
        );
      }
    });
  }

  GetRetourEmballageList(page:number) {
    let data = {
      paginate: true,
      page:page,
      limit: 8,
      ...this.filters,
    };
    this._spinner.show();
    this.activiteService.GetRetourEmballageList(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.dataList = res.data;
      this.totalPages = res.total; // nombre total d’enregistrements
      this.nbReceptions = res.totaux?.nbReceptions ?? res.total ?? 0;
      this.totalEmballagesRecus = res.totaux?.totalEmballagesRecus ?? 0;
      this._spinner.hide();
    });
  }
  onSubmit(): void {
    console.log(this.ArticleForm.value);
    if (this.ArticleForm.valid) {
      // const formValues = this.ArticleForm.value;
      const formValues = {
        ...this.ArticleForm.value,
        categorieId: +this.ArticleForm.value.categorieId,
        groupeId: +this.ArticleForm.value.groupeId,
        plastiquenuId: +this.ArticleForm.value.plastiquenuId,
        bouteillevideId: +this.ArticleForm.value.bouteillevideId,
        liquideId: +this.ArticleForm.value.liquideId,
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this.articleService.UpdateArticle(this.articleId, formValues).then(
          (response: any) => {
            console.log('article mis à jour avec succès', response);
            this.toastr.success(response.message);

            this.OnCloseModal();
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.articleService.CreateArticle(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.ArticleForm.reset();
            this.toastr.success(response.message);

            console.log('Nouvel article créé avec succès', response);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
    this.GetRetourEmballageList(this.currentPage);
  }

  genererPdf(): void {
    const data = this.updateData;
    const hist = this.historique;
    const articles = this.filteredArticles || [];
    const articlesRdv: any[] = data.articlesRdv || [];

    // ── Données de base
    const retourId = data.id || 0;
    const numBRE = `BRE-${new Date(data.createdAt).getFullYear()}-${String(retourId).padStart(5, '0')}`;
    const numCommande = data.commandeClient?.NumCommande || data.commandeGratuite?.NumCommande || data.venteChine?.numVenteChine || '—';
    const clientNom = data.clientALivrer?.raisonSocial || data.clientALivrer?.nomEtablissement || '—';
    const clientCode = data.clientALivrer?.codeClient || '—';
    const clientTel = data.clientALivrer?.telephoneGerant || data.clientALivrer?.telephoneProprietaire || data.clientALivrer?.telephone || data.clientALivrer?.contactGerant || '—';
    const depot = data.depot?.nomDepot || '—';
    const motifLabel: Record<string, string> = { IMMEDIATE: 'Immédiat', COMPTANT: 'Comptant', APPOINTMENT: 'Sur rendez-vous' };
    const motif = motifLabel[data.returnType] || data.returnType || '—';
    const dateRecup = data.createdAt ? new Date(data.createdAt) : new Date();
    const dateStr = dateRecup.toLocaleDateString('fr-FR');
    const heureStr = dateRecup.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const chauffeur = data.venteChine
      ? `${data.venteChine.commercial?.nom || ''} ${data.venteChine.commercial?.prenoms || ''}`.trim()
      : data.transporteur ? `${data.transporteur.nom || ''} ${data.transporteur.prenoms || ''}`.trim() : '—';
    const vehicule = data.vehicule ? (data.vehicule.marque || '') + ' ' + (data.vehicule.immatriculation || data.vehicule.plaque || '') : '—';

    // ── Totaux
    const rdvMap = new Map<string, number>(articlesRdv.filter((a: any) => a.typeArticle === 'EMBALLAGE').map((a: any) => [a.productCode, a.quantity] as [string, number]));
    const articleRows = articles.map((a: any) => {
      const qteAttendue = rdvMap.get(a.produit?.code) ?? 0;
      const solde = Math.max(0, qteAttendue - (a.quantity || 0));
      return {
        code: a.produit?.code || '—',
        libelle: a.produit?.libelle || '—',
        unite: a.produit?.condition || 'PCE',
        qteAttendue,
        qteRecuperee: a.quantity || 0,
        solde,
      };
    });

    const totalAttendu = hist?.totalAttendu ?? articleRows.reduce((s: number, r: any) => s + r.qteAttendue, 0);
    const totalRecupere = articleRows.reduce((s: number, r: any) => s + r.qteRecuperee, 0);
    const soldeTotal = hist?.soldeActuel ?? Math.max(0, totalAttendu - totalRecupere);

    // ── Init PDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 0;

    // ── En-tête bleu
    doc.setFillColor(0, 84, 166);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('BON DE RECUPERATION D\'EMBALLAGES', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${numBRE}`, margin, 19);
    doc.text(`Date : ${dateStr}   Heure : ${heureStr}`, pageW - margin, 19, { align: 'right' });

    y = 35;

    // ── Section CLIENT
    const drawSectionTitle = (title: string, cy: number) => {
      doc.setFillColor(230, 240, 255);
      doc.rect(margin, cy, pageW - margin * 2, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 60, 130);
      doc.text(title, margin + 2, cy + 5);
      return cy + 10;
    };

    const drawInfoRow = (label: string, value: string, lx: number, vx: number, cy: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(90, 90, 90);
      doc.setFontSize(8.5);
      doc.text(label + ' :', lx, cy);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      doc.text(value, vx, cy);
    };

    y = drawSectionTitle('CLIENT', y);
    drawInfoRow('Nom / Raison sociale', clientNom, margin, margin + 42, y);
    drawInfoRow('Code client', clientCode, pageW / 2, pageW / 2 + 30, y);
    y += 6;
    drawInfoRow('Telephone', clientTel, margin, margin + 42, y);
    y += 10;

    // ── Section INFORMATIONS DE LA RECUPERATION
    y = drawSectionTitle('INFORMATIONS DE LA RECUPERATION', y);
    drawInfoRow('Ref. BL d\'origine', numCommande, margin, margin + 42, y);
    drawInfoRow('Depot de rattachement', depot, pageW / 2, pageW / 2 + 42, y);
    y += 6;
    drawInfoRow('Livreur / Agent', chauffeur, margin, margin + 42, y);
    drawInfoRow('Vehicule', vehicule.trim() || '—', pageW / 2, pageW / 2 + 42, y);
    y += 6;
    drawInfoRow('Motif', motif, margin, margin + 42, y);
    y += 10;

    // ── Tableau emballages
    y = drawSectionTitle('EMBALLAGES RECUPERES CE JOUR', y);

    const tableRows = articleRows.map((r: any) => [
      r.code,
      r.libelle,
      r.unite,
      r.qteAttendue > 0 ? String(r.qteAttendue) : '—',
      String(r.qteRecuperee),
      String(r.solde),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Code', 'Emballage', 'Unite', 'Qte attendue (RDV)', 'Qte recuperee', 'Solde restant']],
      body: tableRows,
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [0, 84, 166], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 251, 255] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: [200, 80, 0] },
      },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 4;

    // ── Ligne TOTAL
    doc.setFillColor(240, 244, 255);
    doc.rect(margin, y, pageW - margin * 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text(`TOTAL`, margin + 2, y + 5.5);
    const colPositions = { qteAttendue: pageW - margin - 24 - 26 - 30 - 4, qteRec: pageW - margin - 24 - 26 + 2, solde: pageW - margin - 24 + 2 };
    doc.text(String(totalAttendu), colPositions.qteAttendue + 15, y + 5.5, { align: 'center' });
    doc.text(String(totalRecupere), colPositions.qteRec + 13, y + 5.5, { align: 'center' });
    doc.setTextColor(200, 80, 0);
    doc.text(String(soldeTotal), colPositions.solde + 12, y + 5.5, { align: 'center' });
    y += 12;

    // ── Récapitulatif
    if (y > 240) { doc.addPage(); y = 14; }
    y = drawSectionTitle('RECAPITULATIF', y);
    const recapItems: [string, string][] = [
      ['TOTAL ATTENDU (RDV)', `${totalAttendu} emballage(s)`],
      ['TOTAL RECUPERE CE JOUR', `${totalRecupere} emballage(s)`],
      ['SOLDE RESTANT', `${soldeTotal} emballage(s)`],
    ];
    recapItems.forEach(([label, val], i) => {
      const bg = i % 2 === 0 ? [245, 248, 255] : [255, 255, 255];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(margin, y, pageW - margin * 2, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8.5);
      doc.text(label, margin + 2, y + 5);
      doc.setTextColor(i === 2 ? 200 : 20, i === 2 ? 80 : 20, 20);
      doc.text(val, pageW - margin - 2, y + 5, { align: 'right' });
      y += 7;
    });
    y += 6;

    // ── Historique
    if (hist?.historique?.length) {
      if (y > 220) { doc.addPage(); y = 14; }
      y = drawSectionTitle('HISTORIQUE DES RECUPERATIONS', y);
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
          2: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [200, 80, 0] },
        },
        margin: { left: margin, right: margin },
        foot: [[`SOLDE TOTAL ACTUEL`, '', `${hist.soldeActuel} emballage(s)`]],
        footStyles: { fillColor: [220, 228, 245], fontStyle: 'bold', textColor: [0, 40, 100] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ── Signatures
    if (y > 235) { doc.addPage(); y = 14; }
    const sigW = (pageW - margin * 2 - 10) / 2;
    doc.setFillColor(245, 248, 255);
    doc.rect(margin, y, sigW, 30, 'F');
    doc.rect(margin + sigW + 10, y, sigW, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 60, 130);
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
    const footer1 = 'En signant ce document, le client reconnait avoir remis les emballages ci-dessus.';
    const footer2 = 'Ce document ne vaut pas facture. Seule la facture emise fera foi quant au montant du.';
    doc.text(footer1, pageW / 2, y, { align: 'center' });
    doc.text(footer2, pageW / 2, y + 4, { align: 'center' });

    doc.save(`BRE-${numCommande}-${dateStr.replace(/\//g, '-')}.pdf`);
  }
}
