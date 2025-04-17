import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';

@Component({
  selector: 'app-list-prix',
  templateUrl: './list-prix.component.html',
  styleUrls: ['./list-prix.component.scss'],
})
export class ListPrixComponent implements OnInit {
  dataList = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  prixId: any;
  dataListTypesPrix: any;
  dataListProduits: any;
  prixForm: FormGroup;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private location: Location,


  ) {}
  ngOnInit() {
    this.prixForm = this.fb.group({
      libelle: [null, Validators.required],
    });
    this.GetListTypePrix(1);
  }
  GetListTypePrix(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetListTypePrix(data).then((res: any) => {
      console.log('DATAPRIX:::>', res);
      this.totalPages = res.totalPages * data.limit; // nombre total d’enregistrements

      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetListTypePrix(this.currentPage);
  }
  goBack() {
    this.location.back()
  }
  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || '';
    this.dt2.filterGlobal(value, 'contains');
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeleteTypePrix(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetListTypePrix(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
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
    this.prixId = data.id;
    this.prixForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  
  onSubmit(): void {
    console.log(this.prixForm.value);
    if (this.prixForm.valid) {
      const formValues = this.prixForm.value;
  
    
      if (this.isEditMode) {
        this.articleService.UpdateTypePrix(this.prixId, formValues).then(
          (response: any) => {
            this.prixForm.reset()
            this.OnCloseModal();
            this.GetListTypePrix(1);
            this.toastr.success(response.message);
            console.log('prix mis à jour avec succès', response);

          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la création', error);
          }
        );
      } else {
        this.articleService.CreateTypePrix(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetListTypePrix(1);
            this.prixForm.reset()
            this.toastr.success(response.message);
            console.log('prix crée avec succès', response);

          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
}
