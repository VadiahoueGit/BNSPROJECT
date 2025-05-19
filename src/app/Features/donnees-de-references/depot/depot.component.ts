import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';

@Component({
  selector: 'app-depot',
  templateUrl: './depot.component.html',
  styleUrls: ['./depot.component.scss']
})
export class DepotComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  zones!: any[];
  DepotForm!: FormGroup;
  depotId = 0
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
  dataListlocalite: any;
  currentPage: number;
  rowsPerPage: any;
  totalPages: any;
  constructor(
    private coreService: CoreServiceService,
    private _userService: UtilisateurResolveService,
    private location: Location,
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
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetLocaliteList(data).then((res: any) => {
      console.log('GetLocaliteList:::>', res);
      console.log('totalPages:::>', this.totalPages);
      this.dataListlocalite = res.data;
      this._spinner.hide();
    });

    this.DepotForm = this.fb.group({
      nomDepot: [null, Validators.required],
      gerant: [null, Validators.required],
      telephone: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      zoneId: [null, Validators.required],
    });

    this.GetZoneList()
    this.GetDepotList(1);
  }
  goBack() {
    this.location.back()
  }
  GetZoneList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetZoneList(data).then((res: any) => {
      this.zones = res.data
      this._spinner.hide();
      console.log(res)
    })
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
    this.DepotForm.reset();
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.depotId = data.id;
    this.isModalOpen = true;
    this.loadDepotDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetDepotList(page:number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetDepotList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataList = res.data;
      this.totalPages = res.total
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetDepotList(this.currentPage);
  }

  onSubmit(): void {
    console.log(this.DepotForm);
    if (this.DepotForm.valid) {
      console.log('formValues', this.DepotForm.value);

      if (this.isEditMode) {
        this._coreService.UpdateDepot(this.depotId, this.DepotForm.value).then(
          (response: any) => {
            console.log('Utilisateur mis à jour avec succès', response);
            // this.toastr.success('Succès!', 'Utilisateur  mis à jour avec succès.');
            this.toastr.success(response.message);

            this.OnCloseModal();
            this.DepotForm.reset();
            this.GetDepotList(1);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._coreService.CreateDepot(this.DepotForm.value).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetDepotList(1);
            this.DepotForm.reset();
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
  loadDepotDetails(): void {
    this.DepotForm.patchValue({
      nomDepot: this.updateData.nomDepot,
      gerant: this.updateData.gerant,
      telephone: this.updateData.telephone,
      latitude: this.updateData.latitude,
      longitude: this.updateData.longitude,
      zoneId: this.updateData.zone.id,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._coreService.DeleteDepot(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetDepotList(1);
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
