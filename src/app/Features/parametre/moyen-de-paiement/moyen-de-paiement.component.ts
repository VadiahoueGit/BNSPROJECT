import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';
import { FinanceService } from 'src/app/core/finance.service';

@Component({
  selector: 'app-moyen-de-paiement',
  templateUrl: './moyen-de-paiement.component.html',
  styleUrls: ['./moyen-de-paiement.component.scss']
})
export class MoyenDePaiementComponent {

  dataList = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  prixId: any;
  dataListTypesPrix: any;
  dataListProduits: any;
  moyenPaiementForm: FormGroup;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  constructor(
    private _financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private location: Location,


  ) {}
  ngOnInit() {
    this.moyenPaiementForm = this.fb.group({
      libelle: [null, Validators.required],
    });
    this.GetListMoyenPaiement(1);
  }
  GetListMoyenPaiement(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._financeService.GetMoyenPaiementList(data).then((res: any) => {
      console.log('MOYEN PAIEMENT LIST:::>', res);
      this.totalPages = res.total * data.limit; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);

      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetListMoyenPaiement(this.currentPage);
  }
  goBack() {
    this.location.back()
  }
  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || '';
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
    this.prixId = data.id;
    this.moyenPaiementForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  
  onSubmit(): void {
    console.log(this.moyenPaiementForm.value);
    if (this.moyenPaiementForm.valid) {
      const formValues = this.moyenPaiementForm.value;
  
    
      if (this.isEditMode) {
        this._financeService.UpdateMoyenPaiement(this.prixId, formValues).then(
          (response: any) => {
            this.moyenPaiementForm.reset()
            this.OnCloseModal();
            this.GetListMoyenPaiement(1);
            this.toastr.success(response.message);
            console.log('moyen de paiement mis à jour avec succès', response);

          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la création', error);
          }
        );
      } else {
        this._financeService.CreateMoyenPaiement(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetListMoyenPaiement(1);
            this.moyenPaiementForm.reset()
            this.toastr.success(response.message);
            console.log('moyen de paiement crée avec succès', response);

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

