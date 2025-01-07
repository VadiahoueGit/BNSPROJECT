import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';
import {UtilisateurResolveService} from "../../../../core/utilisateur-resolve.service";

@Component({
  selector: 'app-saisie-commande-gratuite',
  templateUrl: './saisie-commande-gratuite.component.html',
  styleUrls: ['./saisie-commande-gratuite.component.scss']
})
export class SaisieCommandeGratuiteComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  selectedArticles: any[] = [];
  pointDeVente!: any[];
  CommandeForm!:FormGroup
  isChoiceModalOpen: boolean
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  searchTerm: string = '';
  filteredArticleList: any[] = [];
  dataListLiquides: any=[];
  dataListArticlesProduits: any=[];
  currentPage: number;
  rowsPerPage: any;
  selectedOption: string = 'gratuitClient';
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private utilisateurService:UtilisateurResolveService
  ) {}

  ngOnInit() {
    this.CommandeForm = this.fb.group({
      clientId: [null, Validators.required],
      articles: [null, Validators.required],
    });
    this.GetArticleList(1)
    this.LoadPdv()
  }

  GetArticleList(page:number) {
    let data = {
      paginate: false,
      page:page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListLiquides = res.data;
      this.filteredArticleList = this.dataListLiquides;
      this._spinner.hide();
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

  selectArticle() {
    this.isEditMode = false;
    this.isChoiceModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }
  OnEdit(data:any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  onSubmit(): void {
    console.log(this.CommandeForm.value);

  }
  LoadPdv() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.utilisateurService.GetPointDeVenteList(data).then((res: any) => {
      this.pointDeVente = res.data
      console.log('pointDeVente', res)
    }, (error: any) => {
      this._spinner.hide()
    })
  }
  onCheckboxChange(article: any): void {
    if (article.isChecked) {
      this.selectedArticles.push(article);
      this.afficherArticlesSelectionnes()
    } else {
      delete article.quantite;
      const indexToRemove = this.selectedArticles.findIndex(
        (selectedArticle:any) => selectedArticle.libelle === article.libelle
      );
      if (indexToRemove !== -1) {
        this.selectedArticles.splice(indexToRemove, 1);
        this.afficherArticlesSelectionnes()
      }
    }
  }
  onSubmitSelection() {
    this.isChoiceModalOpen = false;
  }

  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }
  filterArticles(): void {
    console.log(this.searchTerm)
    if (this.searchTerm) {
      this.filteredArticleList = this.dataListLiquides.filter((article: any) =>
        article.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        article.code.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      console.log(this.filteredArticleList)
    } else {
      this.filteredArticleList = [...this.dataListLiquides];
    }
  }
  OnCloseChoiceModal() {
    this.deselectAllItems()
    this.isChoiceModalOpen = false;
    console.log(this.isModalOpen)
  }
  deselectAllItems(): void {
    this.selectedArticles.forEach((item: any) => {
      delete item.quantite;
      this.onCheckboxChange(item);
      item.isChecked = false;

    });

    this.selectedArticles = [];

  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res:any) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
}
