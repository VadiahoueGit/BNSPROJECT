import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {ALERT, ALERT_INFO, ALERT_QUESTION, storage_keys} from '../../shared-component/utils';
import {Location} from '@angular/common';
import {CoreServiceService} from "../../../core/core-service.service";
import {LocalStorageService} from "../../../core/local-storage.service";

type Stock = {
  id: number;
  quantiteDisponible: number;
  derniereMiseAJour: string;
  IsDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type MouvementStockDetail = {
  id: number;
  quantite: number;
  stockAvantMouvement: number;
  stockApresMouvement: string;
  mouvement: any;
  stock: Stock;
};

type StockEntry = {
  id: number;
  quantiteDisponible: number;
  derniereMiseAJour: string;
  IsDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  depot: {
    id: number;
    nomDepot: string;
    gerant: string;
    latitude: string;
    longitude: string;
    telephone: string;
    IsDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
  mouvementStockDetail: MouvementStockDetail[];
};

@Component({
  selector: 'app-mouvement-stock',
  templateUrl: './mouvement-stock.component.html',
  styleUrls: ['./mouvement-stock.component.scss']
})


export class MouvementStockComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList: any[] = [];
  articleList: any[] = [];
  searchTerm: string = '';
  filteredArticleList: any[] = [];
  selectedArticles: any[] = [];
  loading: boolean = true;
  isModalOpen = false;
  isArticleModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  currentPage = 1;
  rowsPerPage = 20;
  totalItems = 0;
  isAllSelected: boolean = false;
  now = new Date().toISOString().split('T')[0];
  UserInfo: any
  depotList: any[] = [];
  selectedDepotId: any = null;
  liquideList: any[] = [];
  emballageList: any[] = [];
  selectedLiquideId: any = null;
  selectedEmballageId: any = null;
  selectedType: any = null;
  filterDateDebut: string = '';
  filterDateFin: string = '';
  natureOptions = [
    { label: 'Entrée', value: 'ENTREE' },
    { label: 'Sortie', value: 'SORTIE' },
    { label: 'Retour', value: 'RETOUR' },
  ];
  selectedCode: any = null;
  selectedOperation: any = null;
  codeOptions = [
    { label: 'Emb', value: 'Emb' },
    { label: 'Vemb', value: 'Vemb' },
  ];
  // Opérations telles qu'elles sont enregistrées sur le mouvement. Choisir « Regule » ou
  // « Transfert » ramène aussi leurs lignes affichées « … emballage ».
  operationOptions = [
    'Regule',
    'Transfert',
    'Retour plein',
    'Retour stock',
    'Commande client',
    'Commande gratuite',
    'Vente Chine',
    'Commande fournisseur',
    'Réception commande fournisseur',
    'Retour emballage fournisseur',
    'Sortie emballage fournisseur',
    'Entrée gratuite',
    'Inventaire emballage',
  ];

  constructor(
    private localstorage: LocalStorageService,
    private articleService: ArticleServiceService,
    private _coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private location: Location,
  ) {
  }

  ngOnInit() {
    this.UserInfo = this.localstorage.getItem(storage_keys.STOREUser);
    this._spinner.show();
    this.GetMouvementStock(1);
    this.GetDepotList();
    this.GetLiquideList();
    this.GetEmballageList();

      // setInterval(() => {
      //   if(this.dataList.length > 0){
      //   this.GetMouvementStock(1)
      //     }
      // }, 10000);
    }
    

  flattenStockMovements(stockData: any[]): MouvementStockDetail[] {
    const stockEntries: StockEntry[] = stockData[0];  // Récupérer les StockEntries à l'indice 0
    const flattenedData = stockEntries.flatMap(entry =>
      entry.mouvementStockDetail ? entry.mouvementStockDetail.map(detail => ({
        ...detail,
        stock: entry,
        depot: entry.depot
      })) : []
    );

    // Trier par 'updatedAt' en ordre décroissant
    return flattenedData.sort((a: any, b: any) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return dateB.getTime() - dateA.getTime();  // Tri décroissant
    });
  }


  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  onSubmitSelection() {
    this.isArticleModalOpen = false;
  }

  OnEdit(data: any) {
    this.updateData = data;
    ALERT_INFO(
      'info',
      'Information !',
      this.updateData.commentaire ?? "Aucun commentaire renseigné"
    ).then((res) => {
      
    });
  }


  GetMouvementStock(page: number) {
    this.articleService.GetMouvementStock({
      paginate: true,
      page,
      limit: this.rowsPerPage,
      depotId: this.selectedDepotId,
      liquideId: this.selectedLiquideId,
      emballageId: this.selectedEmballageId,
      type: this.selectedType,
      dateDebut: this.filterDateDebut,
      dateFin: this.filterDateFin,
      code: this.selectedCode,
      nature: this.selectedOperation,
    }).then((res: any) => {
      this.dataList = res.data || [];
      this.totalItems = res.total || 0;
      this._spinner.hide();
    });
  }

  GetDepotList() {
    this._coreService.GetDepotList({ paginate: false, page: 1, limit: 100 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  GetLiquideList() {
    this.articleService.GetLiquideList({ paginate: false, page: 1, limit: 1000 }).then((res: any) => {
      this.liquideList = res.data || [];
    });
  }

  GetEmballageList() {
    this.articleService.GetEmballageList({ paginate: false, page: 1, limit: 1000 }).then((res: any) => {
      this.emballageList = res.data || [];
    });
  }

  onDepotFilterChange() {
    this.currentPage = 1;
    this._spinner.show();
    this.GetMouvementStock(1);
  }

  onFilterChange() {
    this.currentPage = 1;
    this._spinner.show();
    this.GetMouvementStock(1);
  }

  resetFilters() {
    this.selectedDepotId = null;
    this.selectedLiquideId = null;
    this.selectedEmballageId = null;
    this.selectedType = null;
    this.selectedCode = null;
    this.selectedOperation = null;
    this.filterDateDebut = '';
    this.filterDateFin = '';
    this.onFilterChange();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.rowsPerPage);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this._spinner.show();
    this.GetMouvementStock(page);
  }

  goBack() {
    this.location.back()
  }


  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen)
  }

  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            // this.GetArticleList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }

}
