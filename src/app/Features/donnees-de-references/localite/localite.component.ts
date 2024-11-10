import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { CoreServiceService } from 'src/app/core/core-service.service';

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
  constructor(
    private _userService: UtilisateurResolveService,
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
      // prenom: [null, Validators.required],
      // email: [null, Validators.required],
      // telephone_one: [null, Validators.required],
      // telephone_two: [null, Validators.required],
      // password: [null, Validators.required],
      // matricule: [null, Validators.required],
      // fonction: [null, Validators.required],
      // roleId: [0, Validators.required],
    });


    this.GetUserList();
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
    this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetUserList() {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetLocaliteList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onSubmit(): void {
    console.log(this.LocaliteForm.value);
    if (this.LocaliteForm.valid) {
      // const formValues = this.LocaliteForm.value;
      const formValues = {
        ...this.LocaliteForm.value,
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this._coreService.UpdateLocalite(this.localiteId, formValues).then(
          (response: any) => {
            console.log('Utilisateur mis à jour avec succès', response);
            // this.toastr.success('Succès!', 'Utilisateur  mis à jour avec succès.');
            this.toastr.success(response.message);

            this.OnCloseModal();
            this.LocaliteForm.reset();
            this.GetUserList();
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
            this.GetUserList();
            this.LocaliteForm.reset();
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
  loadArticleDetails(): void {
    this.LocaliteForm.patchValue({
      nomLocalite: this.updateData.nomLocalite,
     // email: this.updateData.email,
      // fonction: this.updateData.fonction,
      // matricule: this.updateData.matricule,
      // nom: this.updateData.nom,
      // password: this.updateData.password,
      // prenom: this.updateData.prenom,
      // telephone_one: this.updateData.telephone_one,
      // telephone_two: this.updateData.telephone_two,
      // roleId: this.updateData.role.id,
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
            this.GetUserList();
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
