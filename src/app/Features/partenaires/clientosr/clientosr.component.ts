import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { Location } from '@angular/common';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { ConfigService } from 'src/app/core/config-service.service';

@Component({
  selector: 'app-clientosr',
  templateUrl: './clientosr.component.html',
  styleUrls: ['./clientosr.component.scss'],
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
  currentPage: number;
  rowsPerPage: any;
  selectedFile: File | null = null;
  isModalDetail: boolean = false;
  ClientOsrDetail: any = {};
  apiUrl : any
  imageUrl : any

  constructor(
    private location: Location,
    private coreService: CoreServiceService,
    private utilisateurService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private _config: ConfigService
  ) {
    this.apiUrl = this._config.apiUrl;
  }

  ngOnInit() {
    this.clientosrForm = this.fb.group({
      photo: [null, Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      contactGerant: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      localiteId: [null],
      zoneLivraisonId: [null],
      groupeClientId: [null, Validators.required],
      depotId: [null, Validators.required],
      nomEtablissement: [null, Validators.required],
    });

    this.GetLocaliteList();
    this.GetDepotList();
    this.GetZoneList();
    this.GetGroupeClientList();
    this.GetClientOSRList(1);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  goBack() {
    this.location.back();
  }

  onDepotChange(event: any): void {
    const depotId = event?.id;
    console.log(event, 'depotId');
    if (depotId) {
      this.getDepotDetails(depotId);
    }
  }

  getDepotDetails(depotId: number): void {
    this.coreService
      .GetDepotDetail(depotId)
      .then((response: any) => {
        if (response) {
          console.log(response, 'response');
          this.clientosrForm.patchValue({
            zoneLivraisonId: response.data.zone?.id || null,
            localiteId: response.data.zone.localite?.id || null,
          });
        }
      })
      .catch((error: any) => {
        console.error(
          'Erreur lors de la récupération des informations du dépôt:',
          error
        );
      });
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
    this.clientosrForm.enable();
  }

  OnCreate() {
    this.clientosrForm.enable();
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
    this.clientosrForm.disable();
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

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetClientOSRList(this.currentPage);
  }

  onSubmit(): void {
    this._spinner.show();
    console.log(this.clientosrForm.value);

    if (this.clientosrForm.valid) {
      const formData = new FormData();

      Object.keys(this.clientosrForm.value).forEach((key) => {
        if (key !== 'photo') {
          formData.append(key, this.clientosrForm.value[key]);
        }
      });

      if (this.selectedFile) {
        formData.append('photo', this.selectedFile);
      }

      if (this.isEditMode) {
        this.utilisateurService
          .UpdatePointDeVente(this.articleId, formData)
          .then(
            (response: any) => {
              console.log('Article mis à jour avec succès', response);
              this._spinner.hide();
              this.clientosrForm.reset();
              this.OnCloseModal();
              this.GetClientOSRList(1);
              this.toastr.success(response.message);
            },
            (error: any) => {
              this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
              console.error('Erreur lors de la mise à jour', error);
            }
          );
      } else {
        this.utilisateurService.CreatePointDeVente(formData).then(
          (response: any) => {
            console.log('Nouvel article créé avec succès', response);
            this._spinner.hide();
            this.clientosrForm.reset();
            this.OnCloseModal();
            this.GetClientOSRList(1);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }

  loadClientDetails(): void {
    this.clientosrForm.patchValue({
      photo: this.updateData.photo,
      nomEtablissement: this.updateData.nomEtablissement,
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

  OnValidate(data: any) {
    console.log(data, ' client Osr details');
    this.isModalDetail = true;
    this.ClientOsrDetail = data;
    this.imageUrl = `${this.apiUrl.replace(/\/$/, '')}/${data.photo.replace(/^\//, '')}`;
    console.log(this.imageUrl, ' imageUrl');

  }
  OnCloseDetailModal() {
    this.isModalDetail = false;
    console.log(this.isModalOpen);
  }
  confirmValidateOperation(data: any) {
    if (!data.isValide) {
      ALERT_QUESTION(
        'warning',
        'Attention !',
        'Voulez-vous valider ce client?'
      ).then((res) => {
        if (res.isConfirmed == true) {
          const dataRequest = {
            id: data.id,
            isValide: true,
          };
          this._spinner.show();
          this.utilisateurService
            .ValidatePointDeVente(dataRequest)
            .then((res: any) => {
              console.log('VALIDEEEEEEEEEE:::>', res);
              this.toastr.success(res.message);
              this.OnCloseDetailModal()
              this._spinner.hide();
              this.GetClientOSRList(1);
            });
        }
      });
    }
  }
  OnDelete(id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.utilisateurService.DeletedPointDeVente(id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetClientOSRList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }

  GetClientOSRList(page: number) {
    let data = {
      paginate: false,
      page: page,
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
