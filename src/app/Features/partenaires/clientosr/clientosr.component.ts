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
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      contactGerant: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
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
    this.clientosrForm.enable()
  }
  OnCreate() {
    this.clientosrForm.enable()
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
    this.loadClientDetails();
    this.clientosrForm.disable()
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadClientDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
 
  onSubmit(): void {
    this._spinner.show();
    console.log(this.clientosrForm.value);
    if (this.clientosrForm.valid) {
      // const formValues = this.ArticleForm.value;
      const formValues = {
      
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this.utilisateurService.UpdatePointDeVente(this.articleId, this.clientosrForm.value).then(
          (response: any) => {
            console.log('article mis à jour avec succès', response);
            this._spinner.hide();
            this.clientosrForm.reset();
            this.OnCloseModal();
            this.GetClientOSRList()
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.utilisateurService.CreatePointDeVente(this.clientosrForm.value).then(
          (response: any) => {
            this.OnCloseModal();
            this.clientosrForm.reset();
            this.GetClientOSRList()
            this.toastr.success(response.message);
            this._spinner.hide();
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
  loadClientDetails(): void {
    this.clientosrForm.patchValue({
      nom: this.updateData.nom,
      prenom: this.updateData.prenom,
      latitude: this.updateData.latitude,
      longitude: this.updateData.longitude,
      contactGerant: this.updateData.contactGerant,
      telephone: this.updateData.telephone,
      localiteId: this.updateData.localite.id,
      zoneLivraisonId: this.updateData.zoneDeLivraison.id,
      groupeClientId: this.updateData.GroupeClient.id,
      depotId: this.updateData.depot.id,
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
            this.GetClientOSRList()
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
