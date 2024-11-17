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
  selector: 'app-bouteille-vide',
  templateUrl: './bouteille-vide.component.html',
  styleUrls: ['./bouteille-vide.component.scss']
})
export class BouteilleVideComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  zones!: any[];
  BouteilleVideForm!: FormGroup;
  bouteilleVideId = 0
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  isEditMode: boolean = false;
  dataListFormats: any = [];

  dataListPlastiqueNu: any = [];
  currentPage: number;
  rowsPerPage: any;
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
    this._articleService.GetFormatList().then((res: any) => {
      this.dataListFormats = res;
      console.log(
        'dataListFormats:::>',
        this.dataListFormats
      );
    });
    this.BouteilleVideForm = this.fb.group({
      libelle: [null, Validators.required],
      prixUnitaire: [null, Validators.required],
      format: [null, Validators.required],
    });
    this.GetBouteilleVideList(1)

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
    this.BouteilleVideForm.reset();
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.bouteilleVideId = data.id;
    this.isModalOpen = true;
    this.loadDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetBouteilleVideList(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._articleService.GetBouteilleVideList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetBouteilleVideList(this.currentPage);
  }
  GetArticleList(currentPage: any) {
    throw new Error('Method not implemented.');
  }
  onSubmit(): void {
    console.log(this.BouteilleVideForm);
    if (this.BouteilleVideForm.valid) {
      console.log('formValues', this.BouteilleVideForm.value);

      if (this.isEditMode) {
        this._articleService.UpdateBouteilleVide(this.bouteilleVideId, this.BouteilleVideForm.value).then(
          (response: any) => {
            console.log('Utilisateur mis à jour avec succès', response);
            // this.toastr.success('Succès!', 'Utilisateur  mis à jour avec succès.');
            this.toastr.success(response.message);

            this.OnCloseModal();
            this.BouteilleVideForm.reset();
            this.GetBouteilleVideList(1);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._articleService.CreateBouteilleVide(this.BouteilleVideForm.value).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetBouteilleVideList(1);
            this.BouteilleVideForm.reset();
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
    this.BouteilleVideForm.patchValue({
      libelle: this.updateData.libelle,
      prixUnitaire: this.updateData.prixUnitaire,
      format: this.updateData.format,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._articleService.DeleteBouteilleVide(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetBouteilleVideList(1);
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
