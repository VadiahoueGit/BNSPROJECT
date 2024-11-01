import { Component, ViewChild } from '@angular/core';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-type-article',
  templateUrl: './type-article.component.html',
  styleUrls: ['./type-article.component.scss'],
})
export class TypeArticleComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  articleForm!: FormGroup;
  isEditMode = false;
  articleId: any;
  updateData: any = {};
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,

  ) {}

  ngOnInit() {
    this.articleForm = this.fb.group({
      libelle: ['', Validators.required],
    });
    this.GetTypesArticlesList();
  }

  clear(table: Table) {
    table.clear();
  }
  filterGlobal(event:any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || ''; // Utilisez une valeur par défaut
    this.dt2.filterGlobal(value, 'contains');
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

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.articleForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  onSubmit(): void {
    console.log(this.articleForm.value);
    if (this.articleForm.valid) {
      const formValues = this.articleForm.value;
      this.articleForm.patchValue(this.updateData);
      if (this.isEditMode) {
        this.articleService.UpdateTypesArticles(this.articleId, formValues).then(
          (response: any) => {
            console.log('Article mis à jour avec succès', response);
            this.OnCloseModal();
            this.GetTypesArticlesList();
                 this.toastr.success(response.message);
            console.log('Groupe article mis à jour avec succès', response);


          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      } else {
        this.articleService.CreateTypesArticles(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetTypesArticlesList();
            this.articleForm.reset()
            this.toastr.success(response.message);

          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  OnDelete(articleId: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeleteTypesArticles(articleId).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
           this.GetTypesArticlesList()
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  GetTypesArticlesList() {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetTypesArticlesList(data).then((res: any) => {
      console.log('DATA:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
}
