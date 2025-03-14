import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {ALERT_QUESTION, storage_keys} from '../../shared-component/utils';
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
  depotList: any[];
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
  currentPage: number;
  rowsPerPage: any;
  isAllSelected: boolean = false;
  now = new Date().toISOString().split('T')[0];
  UserInfo: any

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
    this.GetMouvementStock(1)

      setInterval(() => {
        if(this.dataList.length > 0){
        this.GetMouvementStock(1)
          }
      }, 10000);
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
    this.isModalOpen = true;
    this.operation = 'edit';
  }


  GetMouvementStock(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    // this._spinner.show();
    this.articleService.GetMouvementStock(data).then((res: any) => {
      const stockData: StockEntry[] = [res.data];
      console.log(stockData);
      this.dataList = this.flattenStockMovements(stockData);
      console.log(this.dataList);
      this._spinner.hide();
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
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
