import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';
import {ActiviteService} from "../../../../core/activite.service";
import {StatutCommande} from "../../../../utils/utils";
@Component({
  selector: 'app-retour-plein',
  templateUrl: './retour-plein.component.html',
  styleUrls: ['./retour-plein.component.scss']
})
export class RetourPleinComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  ArticleForm!:FormGroup
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number = 0;
  constructor(
    private activiteService: ActiviteService,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetRetourPleinList(1);
  }

  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
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

  OnEdit(data:any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.updateData.articles.forEach((item: any) => {
      if (item.quantiteReelle == 0 && StatutCommande.ATTENTE_VALIDATION) {
        item.quantiteReelle = item.quantite;
      }
    });
    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';

    console.log(this.isModalOpen);
  }
  GetRetourPleinList(page:any) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.activiteService.GetRetourPleinList(data).then((res: any) => {
      this.dataList = res.data;
      this.totalPages = res.total;
      console.log('ALL:::>', this.dataList);
      this._spinner.hide();
    });
  }
  get filteredArticles() {
    return this.updateData.articles?.filter((a:any) => a.prixUnitaire > 0);
  }
  ValidateReturn(item:any){
    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous valider ce retour?'
    ).then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        let data = {
          "articlesRecus": item.articles.map((a: any) => ({
            id: a.id,
            quantiteReelle: a.quantiteReelle,
          }))
        }
        this.activiteService.ValidateRetourPlein(item.id,data).then((res: any) => {
          this.dataList = res.data;
          this.GetRetourPleinList(1)
          this.OnCloseModal();
          console.log('validation:::>', this.dataList);
          this._spinner.hide();
          this.toastr.success(res.message);
        });

      } else {
        this.isModalOpen = false;
      }
    });

  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetRetourPleinList(this.currentPage)
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res:any) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetRetourPleinList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  protected readonly StatutCommande = StatutCommande;
}
