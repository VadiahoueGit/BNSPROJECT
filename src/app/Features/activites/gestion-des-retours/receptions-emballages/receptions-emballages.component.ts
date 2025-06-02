import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import {MotifRetour} from "../../../../utils/utils";
import {ActiviteService} from "../../../../core/activite.service";

@Component({
  selector: 'app-receptions-emballages',
  templateUrl: './receptions-emballages.component.html',
  styleUrls: ['./receptions-emballages.component.scss']
})
export class ReceptionsEmballagesComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  ArticleForm!:FormGroup
  loading: boolean = true;
  isModalOpen = false;
  totalPages: number = 0;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  currentPage: number;
  rowsPerPage: any;
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private activiteService:ActiviteService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {

    this.GetRetourEmballageList(1);
  }

  get filteredArticles() {
    return this.updateData.articles?.filter((a:any) => a.prixUnitaire > 0);
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
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetRetourEmballageList(page:number) {
    let data = {
      paginate: true,
      page:page,
      limit: 8,
    };
    this._spinner.show();
    this.activiteService.GetRetourEmballageList(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.dataList = res.data;
      this.totalPages = res.total; // nombre total d’enregistrements
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
        this.articleService.UpdateArticle(this.articleId, formValues).then(
          (response: any) => {
            console.log('article mis à jour avec succès', response);
            this.toastr.success(response.message);

            this.OnCloseModal();
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.articleService.CreateArticle(formValues).then(
          (response: any) => {
            this.OnCloseModal();
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

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;

    this.GetRetourEmballageList(this.currentPage);
  }
}
