import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';
import { ArticleServiceService } from 'src/app/core/article-service.service';

@Component({
  selector: 'app-plastique-nu',
  templateUrl: './plastique-nu.component.html',
  styleUrls: ['./plastique-nu.component.scss']
})
export class PlastiqueNuComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  zones!: any[];
  PlastiquenuForm!: FormGroup;
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
    this.PlastiquenuForm = this.fb.group({
      libelle: [null, Validators.required],
      prixUnitaire: [null, Validators.required],
      conditionnement: [null, Validators.required],
    });
    this.GetPlastiqueNuList()

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
    this.PlastiquenuForm.reset();
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
  GetPlastiqueNuList() {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this._articleService.GetPlastiqueNuList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onSubmit(): void {
    console.log(this.PlastiquenuForm);
    if (this.PlastiquenuForm.valid) {
      console.log('formValues', this.PlastiquenuForm.value);

      if (this.isEditMode) {
        this._articleService.UpdatePlastiqueNu(this.plastiquenuId, this.PlastiquenuForm.value).then(
          (response: any) => {
            console.log('Utilisateur mis à jour avec succès', response);
            // this.toastr.success('Succès!', 'Utilisateur  mis à jour avec succès.');
            this.toastr.success(response.message);

            this.OnCloseModal();
            this.PlastiquenuForm.reset();
            this.GetPlastiqueNuList();
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._articleService.CreatePlastiqueNu(this.PlastiquenuForm.value).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetPlastiqueNuList();
            this.PlastiquenuForm.reset();
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
    this.PlastiquenuForm.patchValue({
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
            this.GetPlastiqueNuList();
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
