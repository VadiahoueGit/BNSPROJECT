import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-localite',
  templateUrl: './localite.component.html',
  styleUrls: ['./localite.component.scss']
})
export class LocaliteComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  LocaliteForm!: FormGroup;
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
  dataListGroupeArticles: any = [];
  dataListBouteilleVide: any = [];
  dataListPlastiqueNu: any = [];
  dataListLiquides: any = [];
  dataListArticlesProduits: any = [];
  dataListProfil: any;
  dataListUsers: any;
  currentPage: number;
  rowsPerPage: any;
  totalPages: any;
  constructor(
    private _userService: UtilisateurResolveService,
    private location: Location,
    private _coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}
  ngAfterViewInit(): void {
    // Initialisation de Bootstrap Select
    // $('.selectpicker').selectpicker('refresh');
  }
  ngOnInit() {
    this.LocaliteForm = this.fb.group({
      nomLocalite: [null, Validators.required],
    });


    this.GetList(1);
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
    this.LocaliteForm.reset();
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.localiteId = data.id;
    this.isModalOpen = true;
    this.loadDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetList(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetLocaliteList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.totalPages = res.total * data.limit; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetList(this.currentPage);
  }
  onSubmit(): void {
    console.log(this.LocaliteForm.value);
    if (this.LocaliteForm.valid) {
       const formValues = this.LocaliteForm.value;
      
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this._coreService.UpdateLocalite(this.localiteId, formValues).then(
          (response: any) => {
            console.log('Utilisateur mis à jour avec succès', response);
            this.toastr.success(response.message);

            this.OnCloseModal();
            this.LocaliteForm.reset();
            this.GetList(1);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._coreService.CreateLocalite(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetList(1);
            this.LocaliteForm.reset();
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
    this.LocaliteForm.patchValue({
      nomLocalite: this.updateData.nomLocalite,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._coreService.DeleteLocalite(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  OnDisabled(data:any){
    console.log(data,'data')
  }
}
