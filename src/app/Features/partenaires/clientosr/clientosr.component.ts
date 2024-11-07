import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { Location } from '@angular/common';
import { CoreServiceService } from 'src/app/core/core-service.service';

@Component({
  selector: 'app-clientosr',
  templateUrl: './clientosr.component.html',
  styleUrls: ['./clientosr.component.scss']
})
export class ClientosrComponent {
  @ViewChild('dt2') dt2!: Table;
  dataList!: any[];
  clientosrForm!: FormGroup;
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

  constructor(
    private location: Location,
    private coreService:CoreServiceService,
    private utilisateurService:UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.clientosrForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      contactGerant: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      localiteId: [null, Validators.required],
      zoneLivraisonId: [null, Validators.required],
      groupeClientId: [null, Validators.required],
      depotId: [null, Validators.required]
    });
  
    this.GetLocaliteList()
    this.GetDepotList()
    this.GetZoneList()
    this.GetGroupeClientList()
    this.GetClientOSRList()
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
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
 
  onSubmit(): void {
    console.log(this.clientosrForm.value);
    if (this.clientosrForm.valid) {
      // const formValues = this.ArticleForm.value;
      const formValues = {
      
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this.utilisateurService.UpdatePointDeVente(this.articleId, formValues).then(
          (response: any) => {
            console.log('article mis à jour avec succès', response);

            this.OnCloseModal();
            // this.GetArticleList();
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.utilisateurService.CreatePointDeVente(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.clientosrForm.reset();
            this.toastr.success(response.message);

            console.log('Nouvel article créé avec succès', response);
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
    this.clientosrForm.patchValue({
      photo: this.updateData.photo ?? '',
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      Conditionnement: this.updateData.Conditionnement,
      categorieId: this.updateData.categorieproduit.id,
      groupeId: this.updateData.groupearticle.id,
      plastiquenuId: this.updateData.plastiquenu.id,
      bouteillevideId: this.updateData.bouteillevide.id,
      liquideId: 1,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.utilisateurService.DeletedPointDeVente(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            // this.GetArticleList();
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
 
  GetClientOSRList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.utilisateurService.GetPointDeVenteList(data).then((res: any) => {
      console.log('GetClientOSRList:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }

  GetLocaliteList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetLocaliteList(data).then((res: any) => {
      console.log('GetLocaliteList:::>', res);
      this.localite = res.data;
      this._spinner.hide();
    });
  }

  GetDepotList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetDepotList(data).then((res: any) => {
      console.log('GetDepotList:::>', res);
      this.depots = res.data;
      this._spinner.hide();
    });
  }

  GetZoneList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetZoneList(data).then((res: any) => {
      console.log('GetZoneList:::>', res);
      this.zoneLivraison = res.data;
      this._spinner.hide();
    });
  }

  GetGroupeClientList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetGroupeClientList(data).then((res: any) => {
      console.log('GetZoneList:::>', res);
      this.grpClient = res.data;
      this._spinner.hide();
    });
  }
}
