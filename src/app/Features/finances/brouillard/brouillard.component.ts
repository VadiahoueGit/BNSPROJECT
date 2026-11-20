import { Component } from '@angular/core';
import { FinanceService } from '../../../core/finance.service';
import { CoreServiceService } from '../../../core/core-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { isDepotHote } from '../../../utils/utils';

@Component({
  selector: 'app-brouillard',
  templateUrl: './brouillard.component.html',
  styleUrls: ['./brouillard.component.scss'],
  animations: [
    trigger('fadeOutUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      state('out', style({ opacity: 0, transform: 'translateY(-20px)' })),
      transition('in => out', animate('300ms ease-out')),
    ]),
    trigger('fadeInDown', [
      state('out', style({ opacity: 0, transform: 'translateY(-20px)' })),
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('out => in', animate('300ms ease-in')),
    ]),
  ],
})
export class BrouillardComponent {
  isCreating = false;
  filteredList: any[] = [];
  isHote = isDepotHote();

  // Totaux globaux (API)
  totalEntrees = 0;
  totalSorties = 0;
  soldeCaisse = 0;
  totalDepenses = 0;

  // Totaux par moyen (API)
  totauxParMoyen: { moyen: string; entrees: number; sorties: number; net: number }[] = [];
  moyensDisponibles: string[] = [];

  // Pagination serveur
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;

  // Filtres
  filterSens = '';
  filterMoyen = '';
  filterMotif = '';
  filterDateFrom = '';
  filterDateTo = '';
  filterDepotId: number | null = null;

  depenseForm: FormGroup;
  depotList: any[] = [];
  compteList: any[] = [];
  readonly typesComptePrelevables = ['BANQUE', 'ESPECE', 'MOBILE MONEY'];

  constructor(
    private financeService: FinanceService,
    private coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) {
    this.depenseForm = this.fb.group({
      motifCompteId: [null, Validators.required],
      compteAPreleverId: [null, Validators.required],
      montant: [null, [Validators.required, Validators.min(0)]],
      description: [''],
      depotId: [null],
    });
  }

  ngOnInit() {
    this.GetBrouillard();
    this.GetDepotList();
    this.GetCompteList();
  }

  GetDepotList() {
    this.coreService.GetDepotList({ paginate: false, page: 1, limit: 100 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  GetCompteList() {
    this.financeService.GetCompteList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.compteList = res.data || [];
    });
  }

  private isCompteBanque(c: any): boolean {
    return (c?.typeCompte?.libelle || '').trim().toUpperCase() === 'BANQUE';
  }

  // « Motif » : tous les comptes, avec le préfixe "Versement - " pour les comptes Banque.
  get motifCompteOptions(): { id: number; label: string }[] {
    return this.compteList.map((c: any) => ({
      id: c.id,
      label: `${this.isCompteBanque(c) ? 'Versement - ' : ''}${c.compte} - ${c.libelle}`,
    }));
  }

  // « Compte à prélever » : uniquement les comptes débitables (Banque, Espèce, Mobile Money).
  get comptePreleverOptions(): { id: number; label: string }[] {
    return this.compteList
      .filter((c: any) => this.typesComptePrelevables.includes((c.typeCompte?.libelle || '').trim().toUpperCase()))
      .map((c: any) => ({ id: c.id, label: `${c.compte} - ${c.libelle}` }));
  }

  todayISO(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  GetBrouillard() {
    this._spinner.show();
    this.financeService.GetBrouillard({
      paginate: true,
      page: this.currentPage,
      limit: this.pageSize,
      sens: this.filterSens,
      moyen: this.filterMoyen,
      motif: this.filterMotif,
      dateFrom: this.filterDateFrom,
      dateTo: this.filterDateTo,
      depotId: this.filterDepotId,
    }).then((res: any) => {
      // res.data est un tableau de groupes par dépôt (un seul groupe pour un dépôt non-hôte,
      // potentiellement plusieurs pour le dépôt hôte qui voit tous les dépôts) : on aplatit
      // tous les groupes en une liste unique, en reportant le dépôt sur chaque ligne.
      this.filteredList = (res.data || []).flatMap((g: any) =>
        (g.paiements || []).map((p: any) => ({ ...p, nomDepot: g.nomDepot, depotId: g.depotId }))
      );
      this.totalItems = res.total || 0;
      this.totalEntrees = res.totalEntrees != null ? Number(res.totalEntrees) : 0;
      this.totalSorties = res.totalSorties != null ? Number(res.totalSorties) : 0;
      this.soldeCaisse = this.totalEntrees - this.totalSorties;
      this.totauxParMoyen = res.totauxParMoyen || [];
      this.moyensDisponibles = this.totauxParMoyen.map((m: any) => m.moyen).filter(Boolean);
      this.totalDepenses = this.totalSorties;
      this._spinner.hide();
    }, () => this._spinner.hide());
  }

  applyFilters() {
    this.currentPage = 1;
    this.GetBrouillard();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.GetBrouillard();
  }

  resetFilters() {
    this.filterSens = '';
    this.filterMoyen = '';
    this.filterMotif = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterDepotId = null;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterSens || this.filterMoyen || this.filterMotif || this.filterDateFrom || this.filterDateTo || this.filterDepotId);
  }

  onCancel() { this.isCreating = false; }
  OnCreate() { this.isCreating = true; }

  saveDepense() {
    this._spinner.show();
    const payload = { ...this.depenseForm.value, dateDepense: this.todayISO() };
    this.financeService.SaveDepense(payload).then((res: any) => {
      this.toastr.success(res.message, 'Succès');
      this.onCancel();
      this.depenseForm.reset();
      this.GetBrouillard();
      this._spinner.hide();
    }, (err: any) => {
      this._spinner.hide();
      this.toastr.error(err?.error?.message || "Erreur lors de l'enregistrement de la dépense.");
    });
  }

  isDepense(row: any): boolean {
    return !!row?.transaction?.depenseId;
  }

  annulerDepense(row: any) {
    ALERT_QUESTION('warning', 'Annuler cette dépense ?', 'Cette action est irréversible.').then((res) => {
      if (res.isConfirmed) {
        this._spinner.show();
        this.financeService.AnnulerDepense(row.transaction.depenseId).then((result: any) => {
          this._spinner.hide();
          this.toastr.success(result.message);
          this.GetBrouillard();
        }).catch((err: any) => {
          this._spinner.hide();
          this.toastr.error(err?.error?.message || "Erreur lors de l'annulation.");
        });
      }
    });
  }
}
