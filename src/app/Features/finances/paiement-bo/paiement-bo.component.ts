import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FinanceService } from '../../../core/finance.service';

@Component({
  selector: 'app-paiement-bo',
  templateUrl: './paiement-bo.component.html',
  styleUrls: ['./paiement-bo.component.scss'],
})
export class PaiementBoComponent implements OnInit {
  dataList: any[] = [];
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;

  totalAPercevoir = 0;
  totalRestant = 0;

  filters = { commande: '', client: '', motif: '', statut: '', dateDebut: '', dateFin: '' };
  statutOptions = ['En attente', 'En cours', 'Partiellement reglé', 'Payé'];

  isModalOpen = false;
  selectedTransaction: any = null;
  moyensPaiement: any[] = [];
  dataListCompte: any[] = [];
  filteredComptes: any[] = [];

  paiementForm!: FormGroup;

  constructor(
    private financeService: FinanceService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.paiementForm = this.fb.group({
      montantPercu: [null, [Validators.required, Validators.min(1)]],
      moyenDePaiementId: [null, Validators.required],
      compteId: [null],
      numeroCheque: [null, [Validators.pattern(/^[a-zA-Z0-9]+$/)]],
    });
    this.loadList(1);
    this.loadMoyensPaiement();
    this.loadCompteList();
  }

  get selectedMoyen(): any {
    return this.moyensPaiement.find(m => m.id == this.paiementForm.get('moyenDePaiementId')?.value);
  }

  // Le compte à sélectionner dépend du type de compte rattaché au moyen de paiement choisi
  // (ex: moyen "Banque" → seuls les comptes de type "Banque" sont proposés).
  get requiresCompte(): boolean {
    return !!this.selectedMoyen?.typeCompte;
  }

  get requiresNumeroCheque(): boolean {
    return this.selectedMoyen?.libelle === 'Banque' || this.selectedMoyen?.libelle === 'Chèque';
  }

  // Quand le moyen de paiement est rattaché au type de compte "caisse" (stocké en base sous
  // le libellé "ESPECE", pas "Caisse" — on compare sans accents/casse), le choix n'est pas
  // libre : seule la caisse du dépôt de la transaction payée est proposée (cf. validation
  // identique côté serveur dans paiement.service.ts::effectuerPaiement).
  get isCaisseMoyen(): boolean {
    const normalized = (this.selectedMoyen?.typeCompte?.libelle || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    return normalized === 'espece' || normalized === 'caisse';
  }

  updateFilteredComptes() {
    const typeCompteId = this.selectedMoyen?.typeCompte?.id;
    if (!typeCompteId) {
      this.filteredComptes = [];
      return;
    }
    if (this.isCaisseMoyen) {
      const caisse = this.selectedTransaction?.depot?.compte;
      this.filteredComptes = caisse ? [{ ...caisse, label: `${caisse.compte} - ${caisse.libelle}` }] : [];
      this.paiementForm.get('compteId')?.setValue(caisse?.id ?? null);
    } else {
      this.filteredComptes = this.dataListCompte.filter(c => c.typeCompte?.id === typeCompteId);
    }
  }

  onMoyenSelect(mp: any) {
    this.paiementForm.get('moyenDePaiementId')?.setValue(mp.id);
    const compteCtrl = this.paiementForm.get('compteId');
    const chequeCtrl = this.paiementForm.get('numeroCheque');
    compteCtrl?.setValue(null);
    this.updateFilteredComptes();
    if (mp.typeCompte) {
      compteCtrl?.setValidators([Validators.required]);
    } else {
      compteCtrl?.setValidators([]);
    }
    if (mp.libelle === 'Banque' || mp.libelle === 'Chèque') {
      chequeCtrl?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]);
    } else {
      chequeCtrl?.setValidators([Validators.pattern(/^[a-zA-Z0-9]+$/)]);
    }
    compteCtrl?.updateValueAndValidity();
    chequeCtrl?.updateValueAndValidity();
  }

  get totalPagesCount(): number {
    return Math.ceil(this.totalPages / this.pageSize);
  }

  loadList(page: number) {
    this.spinner.show();
    this.financeService.GetPaiementListBO({
      paginate: true, page, limit: this.pageSize,
      numeroCommande: this.filters.commande,
      clientNom: this.filters.client,
      motif: this.filters.motif,
      statut: this.filters.statut,
      dateDebut: this.filters.dateDebut,
      dateFin: this.filters.dateFin,
    }).then(
      (res: any) => {
        this.totalPages = res.total || 0;
        this.dataList = res.data || [];
        this.totalAPercevoir = Number(res.totaux?.totalAPercevoir || 0);
        this.totalRestant = Number(res.totaux?.totalRestant || 0);
        this.spinner.hide();
      },
      () => this.spinner.hide()
    );
  }

  loadMoyensPaiement() {
    this.financeService.GetMoyenPaiementList({ paginate: false, page: 1, limit: 100 }).then(
      (res: any) => { this.moyensPaiement = res.data || []; }
    );
  }

  loadCompteList() {
    this.financeService.GetCompteList({ paginate: false, page: 1, limit: 0 }).then(
      (res: any) => {
        this.dataListCompte = (res.data || []).map((c: any) => ({ ...c, label: `${c.compte} - ${c.libelle}` }));
      }
    );
  }

  filterGlobal() {
    this.currentPage = 1;
    this.loadList(1);
  }

  resetFilters() {
    this.filters = { commande: '', client: '', motif: '', statut: '', dateDebut: '', dateFin: '' };
    this.filterGlobal();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.commande || this.filters.client || this.filters.motif
      || this.filters.statut || this.filters.dateDebut || this.filters.dateFin);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadList(page);
  }

  getNumCommande(row: any): string {
    if (!row) return '—';
    if (row?.paiementsCommandeClient?.length) return row.paiementsCommandeClient[0]?.NumCommande;
    if (row?.paiementsCommandeGratuit?.length) return row.paiementsCommandeGratuit[0]?.NumCommande;
    if (row?.paiementsCommandeFournisseur?.length) return row.paiementsCommandeFournisseur[0]?.NumCommande;
    if (row?.returnStock?.commandeClient?.NumCommande) return row.returnStock.commandeClient.NumCommande;
    if (row?.returnStock?.commandeGratuite?.NumCommande) return row.returnStock.commandeGratuite.NumCommande;
    if (row?.returnStock?.venteChine?.numVenteChine) return row.returnStock.venteChine.numVenteChine;
    if (row?.paiementsVente?.length) return row.paiementsVente[0]?.venteChine?.numVenteChine || '—';
    return '—';
  }

  getClientNom(row: any): string {
    const c = row?.client;
    if (!c) return row?.nomClient || '—';
    if (c.raisonSocial) return c.raisonSocial;
    if (c.nomEtablissement) {
      if (c.createdBy?.nom) return (c.createdBy.nom + ' ' + (c.createdBy.prenoms || '')).trim();
      return c.nomEtablissement;
    }
    if (c.nom) return (c.nom + ' ' + (c.prenoms || '')).trim();
    return row?.nomClient || '—';
  }

  // Compte(s) déjà sélectionné(s) lors de l'encaissement, à afficher sur la ligne (traçabilité,
  // même donnée que celle exposée par le SAP export via banqueRef/compte).
  getComptePaiement(row: any): string {
    const libelles = (row?.paiements || [])
      .filter((p: any) => p.statut !== 'Annulé' && p.fonction !== 'SURPLUS')
      .map((p: any) => p?.banqueRef?.nomBanque || p?.banque || p?.compte?.libelle)
      .filter((libelle: any) => !!libelle);
    return [...new Set(libelles)].join(', ') || '—';
  }

  getSurplusTotal(row: any): number {
    return (row?.paiements || [])
      .flatMap((p: any) => p?.surplusLies || [])
      .filter((s: any) => s.statut !== 'ANNULE')
      .reduce((sum: number, s: any) => sum + Number(s.montant || 0), 0);
  }

  getMoyenIcon(libelle: string): string {
    const l = (libelle || '').toLowerCase();
    if (l.includes('espèce') || l.includes('espece') || l.includes('cash')) return 'fa-money-bill-wave';
    if (l.includes('mobile') || l.includes('momo') || l.includes('wave') || l.includes('orange')) return 'fa-mobile-alt';
    if (l.includes('virement') || l.includes('banque') || l.includes('chèque') || l.includes('cheque')) return 'fa-university';
    if (l.includes('carte')) return 'fa-credit-card';
    return 'fa-wallet';
  }

  openPaiement(row: any) {
    this.selectedTransaction = row;
    this.paiementForm.reset();
    this.paiementForm.get('compteId')?.setValidators([]);
    this.paiementForm.get('numeroCheque')?.setValidators([Validators.pattern(/^[a-zA-Z0-9]+$/)]);
    this.filteredComptes = [];
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedTransaction = null;
  }

  isSubmittingPaiement = false;

  onSubmitPaiement() {
    if (this.paiementForm.invalid || this.isSubmittingPaiement) return;
    this.isSubmittingPaiement = true;
    const { montantPercu, moyenDePaiementId, compteId, numeroCheque } = this.paiementForm.value;
    const transactionId = this.selectedTransaction.id;
    const numTransaction = this.selectedTransaction.numTransaction || transactionId;
    const payload = {
      montantPercu: Number(montantPercu),
      moyenDePaiementId: Number(moyenDePaiementId),
      signatureBase64: '',
      ...(this.requiresCompte ? { compteId: Number(compteId) } : {}),
      ...(this.requiresNumeroCheque ? { numeroCheque } : {}),
    };
    this.spinner.show();
    this.financeService.PayerTransaction(transactionId, payload).then(
      (res: any) => {
        this.spinner.hide();
        this.isSubmittingPaiement = false;
        this.toastr.success(res?.message || 'Paiement effectué avec succès.');
        this.closeModal();
        this.loadList(this.currentPage);
        this.downloadRecu(transactionId, numTransaction);
      },
      (err: any) => {
        this.spinner.hide();
        this.isSubmittingPaiement = false;
        this.toastr.error(err?.error?.message || 'Erreur lors du paiement.');
      }
    );
  }

  downloadRecu(transactionId: number, numTransaction?: string) {
    this.financeService.getRecuPaiement(transactionId).then((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-${numTransaction || transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }).catch(() => this.toastr.error('Erreur lors du téléchargement du reçu'));
  }
}
