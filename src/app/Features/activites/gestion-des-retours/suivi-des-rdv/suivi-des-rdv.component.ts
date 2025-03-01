import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import {ActiviteService} from "../../../../core/activite.service";
import {MotifRetour} from "../../../../utils/utils";

@Component({
  selector: 'app-suivi-des-rdv',
  templateUrl: './suivi-des-rdv.component.html',
  styleUrls: ['./suivi-des-rdv.component.scss']
})
export class SuiviDesRDVComponent {
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
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private activiteService:ActiviteService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetRetourList(1)
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
  GetRetourList(page:number) {
    let data = {
      paginate: false,
      page:page,
      limit: 8,
    };
    this._spinner.show();
    this.activiteService.GetRetourList(data).then((res: any) => {
      console.log('RDV:::>', res);
      this.dataList = res.data.filter((item:any) => item.returnType === MotifRetour.APPOINTMENT && !item.stockUpdated );
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
  loadArticleDetails(): void {
    this.ArticleForm.patchValue({
      photo: this.updateData.photo??"",
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      Conditionnement: this.updateData.Conditionnement,
      categorieId: this.updateData.categorieproduit.id,
      groupeId: this.updateData.groupearticle.id,
      plastiquenuId: this.updateData.plastiquenu.id,
      bouteillevideId: this.updateData.bouteillevide.id,
      liquideId: 1,
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    // this.ger(this.currentPage);
  }
  OnAffect(data:any){

  }

  protected readonly Number = Number;
}
