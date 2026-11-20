import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';
import { FinanceService } from 'src/app/core/finance.service';

@Component({
  selector: 'app-compte',
  templateUrl: './compte.component.html',
  styleUrls: ['./compte.component.scss']
})
export class CompteComponent {
  dataList = [];
  typesCompte: any[] = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  compteId: any;
  compteForm: FormGroup;
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
    this.compteForm = this.fb.group({
      compte: [null, Validators.required],
      libelle: [null, Validators.required],
      typeCompteId: [null, Validators.required],
      estLogistique: [false],
    });
    this.GetListTypeCompte();
    this.GetListCompte(1);
  }

  GetListTypeCompte() {
    let data = { paginate: false, page: 1, limit: 8 };
    this._financeService.GetTypeCompteList(data).then((res: any) => {
      this.typesCompte = res.data;
    });
  }

  GetListCompte(page: number) {
    this.currentPage = page;
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      search: this.searchTerm || '',
    };
    this._spinner.show();
    this._financeService.GetCompteList(data).then((res: any) => {
      this.totalPages = res.total;
      this.dataList = res.data;
      this._spinner.hide();
    }).catch(() => this._spinner.hide());
  }

  onPage(event: any) {
    this.rowsPerPage = event.rows;
    this.GetListCompte(event.first / event.rows + 1);
  }

  goBack() {
    this.location.back();
  }

  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement?.value || '';
    this.GetListCompte(1);
  }

  OnCloseModal() {
    this.isModalOpen = false;
  }

  OnCreate() {
    this.isEditMode = false;
    this.compteForm.reset();
    this.isModalOpen = true;
    this.operation = 'create';
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    this.updateData = data;
    this.compteId = data.id;
    this.compteForm.patchValue({
      compte: data.compte,
      libelle: data.libelle,
      typeCompteId: data.typeCompte ? data.typeCompte.id : null,
      estLogistique: !!data.estLogistique,
    });
    this.isModalOpen = true;
    this.operation = 'edit';
  }

  onSubmit(): void {
    if (this.compteForm.valid) {
      const formValues = this.compteForm.value;

      if (this.isEditMode) {
        this._financeService.UpdateCompte(this.compteId, formValues).then(
          (response: any) => {
            if (response.statusCode >= 400) {
              this.toastr.error(response.message || 'Erreur lors de la mise à jour.');
              return;
            }
            this.compteForm.reset();
            this.OnCloseModal();
            this.GetListCompte(this.currentPage);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error(error?.error?.message || 'Erreur lors de la mise à jour.');
          }
        );
      } else {
        this._financeService.CreateCompte(formValues).then(
          (response: any) => {
            if (response.statusCode >= 400) {
              this.toastr.error(response.message || 'Erreur lors de la création.');
              return;
            }
            this.OnCloseModal();
            this.GetListCompte(1);
            this.compteForm.reset();
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
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer ce compte ?').then((res: any) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this._financeService.DeleteCompte(id).then((res: any) => {
          this.toastr.success(res.message);
          this.GetListCompte(this.currentPage);
          this._spinner.hide();
        }, (error: any) => {
          this._spinner.hide();
          this.toastr.error(error?.error?.message || 'Erreur lors de la suppression.');
        });
      }
    });
  }
}
