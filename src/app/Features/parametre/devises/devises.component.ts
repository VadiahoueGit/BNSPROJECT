import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';

@Component({
  selector: 'app-devises',
  templateUrl: './devises.component.html',
  styleUrls: ['./devises.component.scss']
})
export class DevisesComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  zones!: any[];
  DeviseForm!: FormGroup;
  plastiquenuId = 0
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  localiteId: any = 0;
  isEditMode: boolean = false;
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any = [];

  dataListPlastiqueNu: any = [];
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  constructor(
    private location: Location,
    private _articleService: ArticleServiceService,
    private _coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }
  ngAfterViewInit(): void {
    // Initialisation de Bootstrap Select
    // $('.selectpicker').selectpicker('refresh');
  }
  ngOnInit() {
    this._articleService.GetConditionnementList().then((res: any) => {
      this.dataListConditionnements = res;
      console.log(
        'dataListConditionnements:::>',
        this.dataListConditionnements
      );
    });
    this.DeviseForm = this.fb.group({
      description: [null, Validators.required],
      libelle: [null, Validators.required],
      valeur: [null, Validators.required],
    });
    this.GetPlastiqueNuList(1)

  }
  goBack() {
    this.location.back()
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
    this.DeviseForm.reset();
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.plastiquenuId = data.id;
    this.isModalOpen = true;
    this.loadDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetPlastiqueNuList(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._articleService.GetPlastiqueNuList(data).then((res: any) => {
      console.log('DEVISE:::>', res);
      this.totalPages = res.total * data.limit; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);

      this.dataList = [];
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPlastiqueNuList(this.currentPage);
  }
  onSubmit(): void {
    console.log(this.DeviseForm);
    if (this.DeviseForm.valid) {
      console.log('formValues', this.DeviseForm.value);

      if (this.isEditMode) {
        this._articleService.UpdatePlastiqueNu(this.plastiquenuId, this.DeviseForm.value).then(
          (response: any) => {
            console.log('Utilisateur mis à jour avec succès', response);
            // this.toastr.success('Succès!', 'Utilisateur  mis à jour avec succès.');
            this.toastr.success(response.message);

            this.OnCloseModal();
            this.DeviseForm.reset();
            this.GetPlastiqueNuList(1);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._articleService.CreatePlastiqueNu(this.DeviseForm.value).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetPlastiqueNuList(1);
            this.DeviseForm.reset();
            // this.toastr.success('Succès!', 'Utilisateur créé avec succès.');
            this.toastr.success(response.message);

            console.log('Nouvel Utilisateur créé avec succès', response);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  loadDetails(): void {
    this.DeviseForm.patchValue({
      code: this.updateData.code,
      libelle: this.updateData.libelle,
      prixUnitaire: this.updateData.prixUnitaire,
      conditionnement: this.updateData.conditionnement,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._articleService.DeletePlastiqueNu(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetPlastiqueNuList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  OnDisabled(data: any) {
    console.log(data, 'data')
  }

}