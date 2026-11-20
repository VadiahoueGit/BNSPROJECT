import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';
import { FinanceService } from 'src/app/core/finance.service';

@Component({
  selector: 'app-type-compte',
  templateUrl: './type-compte.component.html',
  styleUrls: ['./type-compte.component.scss']
})
export class TypeCompteComponent {
  dataList = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  typeCompteId: any;
  typeCompteForm: FormGroup;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  searchTerm: string = '';

  constructor(
    private _financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private location: Location,
  ) {}

  ngOnInit() {
    this.typeCompteForm = this.fb.group({
      libelle: [null, Validators.required],
    });
    this.GetListTypeCompte(1);
  }

  GetListTypeCompte(page: number) {
    this.currentPage = page;
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      search: this.searchTerm || '',
    };
    this._spinner.show();
    this._financeService.GetTypeCompteList(data).then((res: any) => {
      this.totalPages = res.total;
      this.dataList = res.data;
      this._spinner.hide();
    }).catch(() => this._spinner.hide());
  }

  onPage(event: any) {
    this.rowsPerPage = event.rows;
    this.GetListTypeCompte(event.first / event.rows + 1);
  }

  goBack() {
    this.location.back();
  }

  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement?.value || '';
    this.GetListTypeCompte(1);
  }

  OnCloseModal() {
    this.isModalOpen = false;
  }

  OnCreate() {
    this.isEditMode = false;
    this.typeCompteForm.reset();
    this.isModalOpen = true;
    this.operation = 'create';
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    this.updateData = data;
    this.typeCompteId = data.id;
    this.typeCompteForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
  }

  onSubmit(): void {
    if (this.typeCompteForm.valid) {
      const formValues = this.typeCompteForm.value;

      if (this.isEditMode) {
        this._financeService.UpdateTypeCompte(this.typeCompteId, formValues).then(
          (response: any) => {
            if (response.statusCode >= 400) {
              this.toastr.error(response.message || 'Erreur lors de la mise à jour.');
              return;
            }
            this.typeCompteForm.reset();
            this.OnCloseModal();
            this.GetListTypeCompte(this.currentPage);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error(error?.error?.message || 'Erreur lors de la mise à jour.');
          }
        );
      } else {
        this._financeService.CreateTypeCompte(formValues).then(
          (response: any) => {
            if (response.statusCode >= 400) {
              this.toastr.error(response.message || 'Erreur lors de la création.');
              return;
            }
            this.OnCloseModal();
            this.GetListTypeCompte(1);
            this.typeCompteForm.reset();
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error(error?.error?.message || 'Erreur lors de la création.');
          }
        );
      }
    }
  }

  OnDelete(id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer ce type de compte ?').then((res: any) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this._financeService.DeleteTypeCompte(id).then((res: any) => {
          this.toastr.success(res.message);
          this.GetListTypeCompte(this.currentPage);
          this._spinner.hide();
        }, (error: any) => {
          this._spinner.hide();
          this.toastr.error(error?.error?.message || 'Erreur lors de la suppression.');
        });
      }
    });
  }
}
