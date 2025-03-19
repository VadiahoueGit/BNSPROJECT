import { Component, ViewChild } from '@angular/core';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-commercial',
  templateUrl: './commercial.component.html',
  styleUrls: ['./commercial.component.scss']
})
export class CommercialComponent {
  @ViewChild('dt2') dt2!: Table;
  dataList!: any[];
  commercialForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  zoneLivraison!: any[];
  grpClient!: any[];
  localite!: any[];
  depots!: any[];
  currentPage: number;
  rowsPerPage: any;

  constructor(
    private location: Location,
    private coreService:CoreServiceService,
    private utilisateurService:UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.commercialForm = this.fb.group({
      nom: [null, Validators.required],
      prenom: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      telephone: [null, [Validators.required]], // Validation pour 10 chiffres
      idCommercialBNS: [null, Validators.required],
      depotId: [null, Validators.required],
    });
    this.GetCommercialList(1)
    this.GetDepotList()
  }
  GetDepotList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetDepotList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.depots = res.data;
      this._spinner.hide();
    });
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
    this.commercialForm.enable()
  }
  OnCreate() {
    this.commercialForm.enable()
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }
  OnPreview(data: any) {
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadCommercialDetails();
    this.commercialForm.disable()
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadCommercialDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;

    // this.GetCommercialList(this.currentPage);
  }
  onSubmit(): void {
    this._spinner.show();
    console.log(this.commercialForm.value);
    if (this.commercialForm.valid) {
      // const formValues = this.ArticleForm.value;
      const formValues = {

      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this.utilisateurService.UpdateCommercial(this.articleId, this.commercialForm.value).then(
          (response: any) => {
            console.log('article mis à jour avec succès', response);
            this._spinner.hide();
            this.commercialForm.reset();
            this.OnCloseModal();
            this.GetCommercialList(1)
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.utilisateurService.CreateCommercial(this.commercialForm.value).then(
          (response: any) => {
            this.OnCloseModal();
            this.commercialForm.reset();
            this.GetCommercialList(1)
            this.toastr.success(response.message);
            this._spinner.hide();
            console.log('Nouvel article créé avec succès', response);
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error('Erreur!', error.error.message);
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  loadCommercialDetails(): void {
    this.commercialForm.patchValue({
      idCommercialBNS: this.updateData.idCommercialBNS,
      nom: this.updateData.nom,
      prenom: this.updateData.prenom,
      email: this.updateData.email,
      telephone: this.updateData.telephone,
      depotId: this.updateData.depot.id,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.utilisateurService.DeleteCommercial(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetCommercialList(1)
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }

  GetCommercialList(page:number)
  {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show()
    this.utilisateurService.GetCommercialList(data).then((res:any)=>{
      this.dataList = res.data
      console.log('currentPage',this.currentPage);
      this._spinner.hide()
      console.log(this.dataList)
    })
  }
}
