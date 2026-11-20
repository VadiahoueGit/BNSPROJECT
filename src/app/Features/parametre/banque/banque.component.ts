import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';
import { FinanceService } from 'src/app/core/finance.service';

@Component({
  selector: 'app-banque',
  templateUrl: './banque.component.html',
  styleUrls: ['./banque.component.scss']
})
export class BanqueComponent {
  dataList = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  banqueId: any;
  banqueForm: FormGroup;
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
    this.banqueForm = this.fb.group({
      codeBanque: [null, Validators.required],
      nomBanque: [null, Validators.required],
      numeroCompte: [null],
    });
    this.GetListBanque(1);
  }

  GetListBanque(page: number) {
    this.currentPage = page;
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      search: this.searchTerm || '',
    };
    this._spinner.show();
    this._financeService.GetBanqueList(data).then((res: any) => {
      this.totalPages = res.total;
      this.dataList = res.data;
      this._spinner.hide();
    }).catch(() => this._spinner.hide());
  }

  onPage(event: any) {
    this.rowsPerPage = event.rows;
    this.GetListBanque(event.first / event.rows + 1);
  }

  goBack() {
    this.location.back();
  }

  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement?.value || '';
    this.GetListBanque(1);
  }

  OnCloseModal() {
    this.isModalOpen = false;
  }

  OnCreate() {
    this.isEditMode = false;
    this.banqueForm.reset();
    this.isModalOpen = true;
    this.operation = 'create';
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    this.updateData = data;
    this.banqueId = data.id;
    this.banqueForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
  }

  onSubmit(): void {
    if (this.banqueForm.valid) {
      const formValues = this.banqueForm.value;

      if (this.isEditMode) {
        this._financeService.UpdateBanque(this.banqueId, formValues).then(
          (response: any) => {
            if (response.statusCode >= 400) {
              this.toastr.error(response.message || 'Erreur lors de la mise à jour.');
              return;
            }
            this.banqueForm.reset();
            this.OnCloseModal();
            this.GetListBanque(this.currentPage);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error(error?.error?.message || 'Erreur lors de la mise à jour.');
          }
        );
      } else {
        this._financeService.CreateBanque(formValues).then(
          (response: any) => {
            if (response.statusCode >= 400) {
              this.toastr.error(response.message || 'Erreur lors de la création.');
              return;
            }
            this.OnCloseModal();
            this.GetListBanque(1);
            this.banqueForm.reset();
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
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer cette banque ?').then((res: any) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this._financeService.DeleteBanque(id).then((res: any) => {
          this.toastr.success(res.message);
          this.GetListBanque(this.currentPage);
          this._spinner.hide();
        }, (error: any) => {
          this._spinner.hide();
          this.toastr.error(error?.error?.message || 'Erreur lors de la suppression.');
        });
      }
    });
  }
}
