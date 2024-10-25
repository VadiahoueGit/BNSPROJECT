import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent {
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
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any= [];
  dataListGroupeArticles: any =[];
  dataListBouteilleVide: any=[];
  dataListPlastiqueNu: any=[];
  dataListLiquides: any=[];
  dataListArticlesProduits: any=[];
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder

  ) {}

  ngOnInit() {
    this.ArticleForm = this.fb.group({
      photo: [null, Validators.required],
      libelle: [null, Validators.required],
      format: [null, Validators.required],
      Conditionnement: [null, Validators.required],
      categorieId: [0, Validators.required],
      groupeId: [0, Validators.required],
      plastiquenuId: [0, Validators.required],
      bouteillevideId: [0, Validators.required],
      liquideId: [0, Validators.required],
    });
    this.articleService.ListPlastiquesNu.subscribe((res: any) => {
      this.dataListPlastiqueNu = res;
    });
    this.articleService.ListLiquides.subscribe((res: any) => {
      this.dataListLiquides = res;
    });
    this.articleService.ListBouteilleVide.subscribe((res: any) => {
      this.dataListBouteilleVide = res;
    });
    this.articleService.ListArticles.subscribe((res: any) => {
      this.dataList = res;
      console.log('dataList:::>', this.dataList);
    });
    this.articleService.ListFormats.subscribe((res: any) => {
      this.dataListFormats = res;
      console.log('dataListFormats:::>', this.dataListFormats);
    });
    this.articleService.ListConditionnements.subscribe((res: any) => {
      this.dataListConditionnements = res;
      console.log('dataListConditionnements:::>', this.dataListConditionnements);
    });
    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res;
      console.log(this.dataListProduits, 'this.dataListProduits ');
    });
    this.articleService.ListGroupesArticles.subscribe((res: any) => {
      this.dataListGroupeArticles = res;
    });
    this.GetArticleList();
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
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetArticleList() {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataList = res.data;
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
        this.loadArticleDetails();

        this.articleService.UpdateEmballage(this.articleId, formValues).then(
          (response: any) => {
            console.log('emballage mis à jour avec succès', response);
            this.OnCloseModal();
            this.GetArticleList();
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.articleService.CreateEmballage(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetArticleList();
            this.ArticleForm.reset();
            console.log('Nouveau emballage créé avec succès', response);
          },
          (error: any) => {
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  loadArticleDetails(): void {
    this.ArticleForm.patchValue({
      photo: this.updateData.photo,
      libelle: this.updateData.libelle,
      Conditionnement: this.updateData.Conditionnement,
      categorieId: this.updateData.categorieId,
      groupeId: this.updateData.groupeId,
      plastiquenuId: this.updateData.plastiquenuId,
      bouteillevideId: this.updateData.bouteillevideId,
      liquideId: this.updateData.liquideId,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            // this.dataList = res.data;
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
}
