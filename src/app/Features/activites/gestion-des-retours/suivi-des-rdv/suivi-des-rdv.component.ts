import { Component, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { ActiviteService } from "../../../../core/activite.service";
import { isDepotHote, getUserDepot } from "../../../../utils/utils";
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';

@Component({
  selector: 'app-suivi-des-rdv',
  templateUrl: './suivi-des-rdv.component.html',
  styleUrls: ['./suivi-des-rdv.component.scss']
})
export class SuiviDesRDVComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  totalPages: number = 0;
  nbRdvEnAttente: number = 0;
  totalEmballagesAttendus: number = 0;
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  currentPage: number;
  rowsPerPage: any;

  filters: any = { numeroCommande: '', agent: '', client: '', depotId: null, dateDebut: '', dateFin: '' };

  // ===== Création manuelle d'un RDV =====
  isHote = isDepotHote();
  depotList: any[] = [];
  revendeurList: any[] = [];
  rdvDepotId: number | null = null;
  rdvClientId: number | null = null;
  rdvDate: string = '';
  selectedArticles: any[] = [];
  isSubmittingRdv = false;

  // ===== Picker emballages/plastiques =====
  isPickerOpen = false;
  pickerSearchTerm = '';
  pickerList: any[] = [];
  filteredPickerList: any[] = [];
  pickerQuantites: { [code: string]: number } = {};

  constructor(
    private articleService: ArticleServiceService,
    private coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private activiteService: ActiviteService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetRetourList(1);
    this.loadDepotList();
  }

  filterGlobal() {
    this.currentPage = 1;
    this.GetRetourList(1);
  }

  resetFilters() {
    this.filters = { numeroCommande: '', agent: '', client: '', depotId: null, dateDebut: '', dateFin: '' };
    this.filterGlobal();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.numeroCommande || this.filters.agent || this.filters.client
      || this.filters.depotId || this.filters.dateDebut || this.filters.dateFin);
  }

  clear(table: Table) {
    table.clear();
  }

  get filteredArticles() {
    return this.updateData.articlesRdv;
  }

  OnCloseModal() {
    this.isModalOpen = false;
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
  }

  GetRetourList(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      ...this.filters,
    };
    this._spinner.show();
    this.activiteService.GetRetourList(data).then((res: any) => {
      this.dataList = res.data;
      this.totalPages = res.total;
      this.nbRdvEnAttente = res.totaux?.nbRdvEnAttente ?? res.total ?? 0;
      this.totalEmballagesAttendus = res.totaux?.totalEmballagesAttendus ?? 0;
    }, (error: any) => {
      this.toastr.error('Erreur!', 'Erreur lors de la récupération des RDV.');
      console.error('Erreur lors de la récupération des RDV', error);
    }).finally(() => {
      this.loading = false;
      this._spinner.hide();
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
    this.GetRetourList(this.currentPage);
  }

  // ===== Création d'un RDV =====

  OnCreate() {
    this.operation = 'create';
    this.isEditMode = false;
    this.rdvDepotId = null;
    this.rdvClientId = null;
    this.rdvDate = '';
    this.revendeurList = [];
    this.selectedArticles = [];
    this.isSubmittingRdv = false;

    const userDepot = getUserDepot();
    if (!this.isHote && userDepot?.id) {
      this.rdvDepotId = userDepot.id;
      this.onDepotChange();
    }

    this.loadDepotList();
    this.isModalOpen = true;
  }

  loadDepotList() {
    if (!this.isHote) return;
    this.coreService.GetDepotList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  onDepotChange() {
    this.rdvClientId = null;
    this.revendeurList = [];
    if (!this.rdvDepotId) return;
    this.articleService.GetListRevendeur({
      paginate: false, page: 1, limit: 0, depotId: this.rdvDepotId,
      raisonSociale: '', proprietaire: '', groupeClient: '',
    }).then((res: any) => {
      this.revendeurList = res.data || [];
    });
  }

  get canSubmitRdv(): boolean {
    return !!this.rdvDepotId && !!this.rdvClientId && !!this.rdvDate && this.selectedArticles.length > 0;
  }

  submitCreateRdv() {
    if (!this.canSubmitRdv || this.isSubmittingRdv) return;
    this.isSubmittingRdv = true;
    const payload = {
      depotId: this.rdvDepotId,
      clientId: this.rdvClientId,
      appointmentDate: this.rdvDate,
      articles: this.selectedArticles.map((a: any) => ({
        codeArticle: a.code,
        quantite: Number(a.quantite),
        prixUnitaire: Number(a.prixUnitaire) || 0,
      })),
    };
    this._spinner.show();
    this.activiteService.CreateRdvManuel(payload).then(
      (res: any) => {
        this._spinner.hide();
        this.isSubmittingRdv = false;
        if (res.statusCode === 201) {
          this.toastr.success(res.message || 'RDV créé avec succès.');
          this.OnCloseModal();
          this.GetRetourList(1);
        } else {
          this.toastr.error(res.message || 'Erreur lors de la création du RDV.');
        }
      },
      (error: any) => {
        this._spinner.hide();
        this.isSubmittingRdv = false;
        this.toastr.error(error?.error?.message || 'Erreur lors de la création du RDV.');
      }
    );
  }

  // ===== Picker emballages/plastiques =====

  openPicker() {
    this.pickerSearchTerm = '';
    this.pickerQuantites = {};
    this.isPickerOpen = true;
    if (this.pickerList.length === 0) {
      this.loadPickerList();
    } else {
      this.filteredPickerList = this.pickerList;
    }
  }

  closePicker() {
    this.isPickerOpen = false;
  }

  loadPickerList() {
    this._spinner.show();
    Promise.all([
      this.articleService.GetEmballageList({ paginate: false, page: 1, limit: 0 }),
      this.articleService.GetPlastiqueNuList({ paginate: false, page: 1, limit: 0 }),
    ]).then(([emballageRes, plastiqueRes]: any[]) => {
      const emballages = (emballageRes.data || []).map((e: any) => ({
        code: e.code, libelle: e.libelle, type: 'Emballage', prixUnitaire: 0,
      }));
      const plastiques = (plastiqueRes.data || []).map((p: any) => ({
        code: p.code, libelle: p.libelle, type: 'Plastique', prixUnitaire: Number(p.prixUnitaire) || 0,
      }));
      this.pickerList = [...emballages, ...plastiques];
      this.filteredPickerList = this.pickerList;
    }).finally(() => this._spinner.hide());
  }

  filterPicker() {
    const term = (this.pickerSearchTerm || '').toLowerCase().trim();
    this.filteredPickerList = !term
      ? this.pickerList
      : this.pickerList.filter((a: any) =>
          (a.code || '').toLowerCase().includes(term) || (a.libelle || '').toLowerCase().includes(term)
        );
  }

  isArticleSelected(code: string): boolean {
    return this.selectedArticles.some((a: any) => a.code === code);
  }

  addArticleFromPicker(item: any) {
    const quantite = Number(this.pickerQuantites[item.code]) || 0;
    if (quantite <= 0) {
      this.toastr.warning('Veuillez saisir une quantité valide.');
      return;
    }
    this.selectedArticles.push({
      code: item.code,
      libelle: item.libelle,
      type: item.type,
      quantite,
      prixUnitaire: item.prixUnitaire || 0,
    });
    this.pickerQuantites[item.code] = 0;
  }

  removeArticle(item: any) {
    this.selectedArticles = this.selectedArticles.filter((a: any) => a.code !== item.code);
  }

  // ===== Annulation d'un RDV créé manuellement =====

  // Un RDV créé depuis cet écran n'est rattaché à aucune commande ni vente (cf. creerRdvManuel côté API)
  estRdvManuel(row: any): boolean {
    return row?.fromTo === 'CONSIGNE' && !row?.commandeClient && !row?.commandeGratuite && !row?.venteChine;
  }

  OnAnnulerRdv(row: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous annuler ce RDV ?').then((res: any) => {
      if (!res.isConfirmed) return;
      this._spinner.show();
      this.activiteService.AnnulerRdvManuel(row.id).then(
        (response: any) => {
          this._spinner.hide();
          if (response.statusCode === 200) {
            this.toastr.success(response.message || 'RDV annulé avec succès.');
            this.OnCloseModal();
            this.GetRetourList(this.currentPage || 1);
          } else {
            this.toastr.error(response.message || "Erreur lors de l'annulation du RDV.");
          }
        },
        (error: any) => {
          this._spinner.hide();
          this.toastr.error(error?.error?.message || "Erreur lors de l'annulation du RDV.");
        }
      );
    });
  }

  get totalArticlesRdv(): number {
    return this.selectedArticles.reduce((sum: number, a: any) => sum + Number(a.quantite || 0), 0);
  }
}
