import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FinanceService } from '../../../core/finance.service';
import { CoreServiceService } from '../../../core/core-service.service';
import { LogistiqueService } from '../../../core/logistique.service';
import { isDepotHote } from '../../../utils/utils';

@Component({
  selector: 'app-recouvrement',
  templateUrl: './recouvrement.component.html',
  styleUrls: ['./recouvrement.component.scss'],
  animations: [
    trigger('fadeInDown', [
      state('out', style({ opacity: 0, transform: 'translateY(-20px)' })),
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('out => in', animate('300ms ease-in')),
    ]),
  ],
})
export class RecouvrementComponent {
  dataList: any[] = [];
  totalPages: number;
  currentPage: number;
  rowsPerPage: any;
  depotList: any[] = [];
  moyensDisponibles: string[] = [];
  isHote = isDepotHote();
  compteList: any[] = [];
  typesComptePrelevables = ['BANQUE', 'ESPECE', 'MOBILE MONEY'];
  motifCompteOptions: { id: number; label: string }[] = [];
  comptePreleverOptions: { id: number; label: string }[] = [];
  vehiculeOptions: { id: number; label: string }[] = [];

  isCreatingDepense = false;
  isCreatingAjout = false;
  depenseForm: FormGroup;
  ajoutCaisseForm: FormGroup;

  // Stats globales (API, sur tout le périmètre filtré)
  totalEntrees = 0;
  totalSorties = 0;
  soldeCaisse = 0;
  totalDepenses = 0;
  totauxParMoyenApi: { moyen: string; entrees: number; sorties: number; net: number }[] = [];
  totauxParMoyen: { moyen: string; entrees: number; sorties: number; net: number }[] = [];

  // Solde caisse / Total Entrées / Solde progressif sont désormais calculés uniquement sur les
  // Espèces (seul moyen qui bouge réellement le tiroir-caisse) : les montants des autres moyens
  // ci-dessous sont purement informatifs. On permet de les masquer d'un coup pour éviter toute
  // confusion avec les indicateurs de caisse réels.
  showAutresMoyens = true;

  isEspecesMoyen(moyen: string): boolean {
    return !!moyen && moyen.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes('espece');
  }

  filters = {
    agent: '',
    dateDebut: '',
    dateFin: '',
    sens: '',
    moyen: '',
    depotId: null as number | null,
  };

  constructor(
    private financeService: FinanceService,
    private coreService: CoreServiceService,
    private logistiqueService: LogistiqueService,
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
      vehiculeId: [{ value: null, disabled: true }],
    });
    this.depenseForm.get('motifCompteId')?.valueChanges.subscribe((motifId: any) => this.onMotifDepenseChange(motifId));
    this.ajoutCaisseForm = this.fb.group({
      motifCompteId: [null, Validators.required],
      compteAPreleverId: [null, Validators.required],
      montant: [null, [Validators.required, Validators.min(0)]],
      description: [''],
      depotId: [null],
    });
  }

  todayISO(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  ngOnInit() {
    this.GetRecouvrementList(1);
    this.GetDepotList();
    this.GetMoyensList();
    this.GetCompteList();
    this.GetVehiculeList();
  }

  GetVehiculeList() {
    this.logistiqueService.GetVehiculeList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.vehiculeOptions = (res.data || []).map((v: any) => ({
        id: v.id,
        label: `${v.immatriculation}${v.marque ? ' - ' + v.marque : ''}`,
      }));
    }).catch(() => { this.vehiculeOptions = []; });
  }

  // Le véhicule n'est requis (et activé) que si le motif sélectionné est marqué "logistique"
  // (carburant, entretien véhicule, réparation...) sur le Compte, cf. compte.component.
  onMotifDepenseChange(motifId: any) {
    const motif = this.compteList.find((c: any) => c.id === motifId);
    const vehiculeCtrl = this.depenseForm.get('vehiculeId');
    if (motif?.estLogistique) {
      vehiculeCtrl?.enable({ emitEvent: false });
      vehiculeCtrl?.setValidators([Validators.required]);
    } else {
      vehiculeCtrl?.reset(null, { emitEvent: false });
      vehiculeCtrl?.disable({ emitEvent: false });
      vehiculeCtrl?.setValidators([]);
    }
    vehiculeCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  get motifDepenseEstLogistique(): boolean {
    const motif = this.compteList.find((c: any) => c.id === this.depenseForm.get('motifCompteId')?.value);
    return !!motif?.estLogistique;
  }

  GetDepotList() {
    this.coreService.GetDepotList({ paginate: false, page: 1, limit: 100 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  // Liste fixe des moyens de paiement enregistrés dans le système (Espèce, Chèque, Banque,
  // Mobile Money...) : les cartes stats et le filtre "Moyen" les affichent tous, même à 0 F,
  // plutôt que de se limiter aux seuls moyens ayant des paiements sur la période filtrée.
  GetMoyensList() {
    this.financeService.GetMoyenPaiementList({ paginate: false, page: 1, limit: 100 }).then((res: any) => {
      this.moyensDisponibles = (res.data || []).map((m: any) => m.libelle).filter(Boolean);
      this.buildTotauxParMoyen();
    });
  }

  // Fusionne la liste fixe des moyens avec les totaux réellement calculés par l'API : chaque
  // moyen apparaît toujours, à 0 F s'il n'a aucun paiement sur la période filtrée.
  private buildTotauxParMoyen() {
    const parMoyen = new Map(this.totauxParMoyenApi.map(m => [m.moyen, m]));
    this.totauxParMoyen = this.moyensDisponibles.map(moyen =>
      parMoyen.get(moyen) || { moyen, entrees: 0, sorties: 0, net: 0 }
    );
  }

  GetCompteList() {
    this.financeService.GetCompteList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.compteList = res.data || [];
      this.updateCompteOptions();
    }).catch((err) => {
      console.error('GetCompteList error:', err);
      this.compteList = [];
    });
  }

  private isCompteBanque(c: any): boolean {
    return (c?.typeCompte?.libelle || '').trim().toUpperCase() === 'BANQUE';
  }

  private updateCompteOptions() {
    this.motifCompteOptions = this.compteList.map((c: any) => ({
      id: c.id,
      label: `${this.isCompteBanque(c) ? 'Versement - ' : ''}${c.compte} - ${c.libelle}`,
    }));
    this.comptePreleverOptions = this.compteList
      .filter((c: any) => this.typesComptePrelevables.includes((c.typeCompte?.libelle || '').trim().toUpperCase()))
      .map((c: any) => ({ id: c.id, label: `${c.compte} - ${c.libelle}` }));
  }

  GetRecouvrementList(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      agent: this.filters.agent || '',
      dateDebut: this.filters.dateDebut || '',
      dateFin: this.filters.dateFin || '',
      sens: this.filters.sens || '',
      moyen: this.filters.moyen || '',
      depotId: this.filters.depotId || '',
    };
    this._spinner.show();
    this.financeService.GetRecouvrementList(data).then(
      (res: any) => {
        this.totalPages = res.total;
        this.dataList = res.data;
        this.totalEntrees = res.totalEntrees != null ? Number(res.totalEntrees) : 0;
        this.totalSorties = res.totalSorties != null ? Number(res.totalSorties) : 0;
        this.soldeCaisse = this.totalEntrees - this.totalSorties;
        this.totalDepenses = this.totalSorties;
        this.totauxParMoyenApi = res.totauxParMoyen || [];
        this.buildTotauxParMoyen();
        this._spinner.hide();
      },
      () => {
        this._spinner.hide();
        this.toastr.error('Erreur lors du chargement du recouvrement.');
      }
    );
  }

  filterGlobal() {
    this.GetRecouvrementList(1);
  }

  resetFilters() {
    this.filters = { agent: '', dateDebut: '', dateFin: '', sens: '', moyen: '', depotId: null };
    this.filterGlobal();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.agent || this.filters.dateDebut || this.filters.dateFin
      || this.filters.sens || this.filters.moyen || this.filters.depotId);
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
    this.GetRecouvrementList(this.currentPage);
  }

  compareById(a: any, b: any): boolean {
    return a && b ? a.id === b.id : a === b;
  }

  OnCreateDepense() {
    this.isCreatingAjout = false;
    this.isCreatingDepense = true;
  }
  onCancelDepense() {
    this.isCreatingDepense = false;
    this.depenseForm.reset();
    this.depenseForm.get('vehiculeId')?.disable({ emitEvent: false });
  }
  saveDepense() {
    const formValue = this.depenseForm.value;
    console.log('saveDepense formValue:', formValue);
    this._spinner.show();
    this.financeService.SaveDepense({ ...formValue, sens: 'SORTIE' }).then((res: any) => {
      this.toastr.success(res.message, 'Succès');
      this.onCancelDepense();
      this.GetRecouvrementList(1);
      this._spinner.hide();
    }, (err: any) => {
      this._spinner.hide();
      this.toastr.error(err?.error?.message || "Erreur lors de l'enregistrement de la dépense.");
    });
  }

  OnCreateAjout() {
    this.isCreatingDepense = false;
    this.isCreatingAjout = true;
  }
  onCancelAjout() {
    this.isCreatingAjout = false;
    this.ajoutCaisseForm.reset();
  }
  saveAjoutCaisse() {
    this._spinner.show();
    this.financeService.SaveDepense({ ...this.ajoutCaisseForm.value, sens: 'ENTREE' }).then((res: any) => {
      this.toastr.success(res.message, 'Succès');
      this.onCancelAjout();
      this.GetRecouvrementList(1);
      this._spinner.hide();
    }, (err: any) => {
      this._spinner.hide();
      this.toastr.error(err?.error?.message || "Erreur lors de l'enregistrement de l'ajout de caisse.");
    });
  }
}
