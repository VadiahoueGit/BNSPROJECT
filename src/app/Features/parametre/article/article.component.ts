import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ALERT_QUESTION} from '../../shared-component/utils';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {ConfigService} from "../../../core/config-service.service";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  ArticleForm!: FormGroup;
  docUrl: any
  loading: boolean = true;
  isModalOpen = false;
  isModalDetailOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any = [];
  dataListGroupeArticles: any = [];
  dataListBouteilleVide: any = [];
  dataListPlastiqueNu: any = [];
  dataListLiquides: any = [];
  dataListArticlesProduits: any = [];
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;

  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private _config: ConfigService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.ArticleForm = this.fb.group({
      reference: [null, Validators.required],
      photo: [null],
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
    this.articleService.ListBouteilleVide.subscribe((res: any) => {
      this.dataListBouteilleVide = res;
    });
    this.articleService.GetFormatList().then((res: any) => {
      this.dataListFormats = res;
      console.log('dataListFormats:::>', this.dataListFormats);
    });

    this.articleService.GetConditionnementList().then((res: any) => {
      this.dataListConditionnements = res;
      console.log(
        'dataListConditionnements:::>',
        this.dataListConditionnements
      );
    });
    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res;
      console.log(this.dataListProduits, 'this.dataListProduits ');
    });
    this.articleService.ListGroupesArticles.subscribe((res: any) => {
      this.dataListGroupeArticles = res;
    });
    this.docUrl = this._config.docUrl;
    this.GetArticleList(1);
    this.GetLiquideList()
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.ArticleForm.patchValue({ photo: file });
      this.ArticleForm.get('photo')?.updateValueAndValidity();
    }
  }

  GetLiquideList()
  {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.totalPages = res.total;
      this.dataListLiquides = res;
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
  OnCloseDetailModal() {
    this.isModalDetailOpen = false;
  }

  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }
  OnView(data: any) {
    this.updateData = data
    this.loadArticleDetails();
    this.isModalDetailOpen = true;
    console.log(this.isModalOpen);
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  GetArticleList(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.totalPages = res.total;

      this.dataList = res.data;
      this._spinner.hide();
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    console.log('currentPage', this.currentPage);
    this.GetArticleList(this.currentPage);
  }

  onSubmit(): void {
    console.log(this.ArticleForm.value);

    if (this.ArticleForm.valid) {
      this._spinner.show();

      const formData = new FormData();
      Object.entries(this.ArticleForm.value).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (this.isEditMode) {
        this.articleService.UpdateArticle(this.articleId, formData).then(
          (response: any) => {
            console.log('article mis à jour avec succès', response);
            this._spinner.hide();
            this.OnCloseModal();
            this.GetArticleList(1);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.articleService.CreateArticle(formData).then(
          (response: any) => {
            this.OnCloseModal();
            this._spinner.hide();
            this.GetArticleList(1);
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


  loadArticleDetails(): void {
    this.ArticleForm.patchValue({
      reference: this.updateData.reference,
      photo: this.updateData.photo ?? '',
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      Conditionnement: this.updateData.Conditionnement,
      categorieId: this.updateData.categorieproduit.id,
      groupeId: this.updateData.groupearticle.id,
      plastiquenuId: this.updateData.plastiquenu.id,
      bouteillevideId: this.updateData.bouteillevide.id,
      liquideId: this.updateData.liquide.id
    });
  }

  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetArticleList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
}
