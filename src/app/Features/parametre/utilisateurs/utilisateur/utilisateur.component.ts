import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.scss']
})
export class UtilisateurComponent implements AfterViewInit{
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  UserForm!:FormGroup
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  userId: any = 0;
  isEditMode: boolean = false;
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any= [];
  dataListGroupeArticles: any =[];
  dataListBouteilleVide: any=[];
  dataListPlastiqueNu: any=[];
  dataListLiquides: any=[];
  dataListArticlesProduits: any=[];
  dataListProfil: any;
  dataListUsers: any;
  constructor(
    private _userService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}
  ngAfterViewInit(): void {
    // Initialisation de Bootstrap Select
    // $('.selectpicker').selectpicker('refresh');
  }
  ngOnInit() {
    this.UserForm = this.fb.group({
      photo: [null],
      nom: [null, Validators.required],
      prenom: [null, Validators.required],
      email: [null, Validators.required],
      telephone_one: [null, Validators.required],
      telephone_two: [null, Validators.required],
      password: [null, Validators.required],
      matricule: [null, Validators.required],
      fonction: [null, Validators.required],
      roleId: [0, Validators.required],
    });
    this._userService.ListProfils.subscribe((res: any) => {
      this.dataListProfil = res;
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
    this.UserForm.reset()
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data:any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.userId = data.id;
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
    this._userService.GetUsersList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onSubmit(): void {
    console.log(this.UserForm.value);
    if (this.UserForm.valid) {
      // const formValues = this.UserForm.value;
      const formValues = {
        ...this.UserForm.value,
       roleId: +this.UserForm.value.roleId,
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this._userService.UpdateUsers(this.userId, formValues).then(
          (response: any) => {
            console.log('Utilisateur mis à jour avec succès', response);
            this.toastr.success('Succès!', 'Utilisateur  mis à jour avec succès.');
            this.OnCloseModal();
            this.UserForm.reset();
            this.GetUserList();
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._userService.CreateUsers(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetUserList();
            this.UserForm.reset();
            this.toastr.success('Succès!', 'Utilisateur créé avec succès.');
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
    this.UserForm.patchValue({
      photo: this.updateData.photo??"",
      email: this.updateData.email,
      fonction: this.updateData.fonction,
      matricule: this.updateData.matricule,
      nom: this.updateData.nom,
      password: this.updateData.password,
      prenom: this.updateData.prenom,
      telephone_one: this.updateData.telephone_one,
      telephone_two: this.updateData.telephone_two,
      roleId: this.updateData.role.id,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._userService.DeleteUsers(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success('Succès!', 'Utilisateur supprimé avec succès.');
            // this.dataList = res.data;
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
}
