import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { LogistiqueService } from 'src/app/core/logistique.service';
import { ToastrService } from 'ngx-toastr';
import { CoreServiceService } from 'src/app/core/core-service.service';

declare var $: any;
@Component({
  selector: 'app-vehicules',
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.scss']
})
export class VehiculesComponent implements AfterViewInit {
  dataList = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  vehiculeId: any;
  depots = [];
  vehicleForm!: FormGroup;
  constructor(
    private coreService:CoreServiceService,
    private _logistiqueService: LogistiqueService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.vehicleForm = this.fb.group({
      marque: [null, Validators.required],
      energie: [null, Validators.required],
      immatriculation: [null, Validators.required],
      dateDeVisite: [null, Validators.required],
      dateAcqui: [null, Validators.required],
      NumeroTelBalise: [0],
      NumeroBalise: [0],
      capacite: [0, Validators.required],
      depotId: [0, Validators.required]
    });

  }
  ngOnInit() {
    this.GetVehiculeList()
    this.GetDepotist()
  }

  ngAfterViewInit(): void {
    // Initialisation de Bootstrap Select
    $('.selectpicker').selectpicker('refresh');
  }


  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || '';
    this.dt2.filterGlobal(value, 'contains');
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  onSubmit() {
    if (this.isEditMode) {
      this._spinner.show();
      this._logistiqueService.UpdateVehicule(this.vehiculeId, this.vehicleForm.value).then((res:any) => {
        this._spinner.hide();
        this.isModalOpen = false;
        this.toastr.success(res.message);
        this.GetVehiculeList()
        console.log(res)
      },
        (error: any) => {
          this.isModalOpen = false;
          this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
          console.error('Erreur lors de la création', error);
        })
    } else {
      this._spinner.show();
      this._logistiqueService.CreateVehicule(this.vehicleForm.value).then((res:any) => {
        this.GetVehiculeList()
        this.toastr.success(res.message);
        this.isModalOpen = false;
        this._spinner.hide();
        console.log(res)
      },
      (error: any) => {
        this.isModalOpen = false;
        this.toastr.error('Erreur!', "Erreur lors de l'enregistrement.");
        console.error('Erreur lors de la création', error);
      })
    }

  }
  GetVehiculeList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this._logistiqueService.GetVehiculeList(data).then((res: any) => {
      this.dataList = res.data
      this._spinner.hide();
      console.log(res)
    })
  }

  GetDepotist() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetDepotList(data).then((res: any) => {
      this.depots = res.data
      this._spinner.hide();
      console.log(res)
    })
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
    this.vehiculeId = data.id;
    this.vehicleForm.patchValue({
      numero: data.numero,
      marque: data.marque,
      energie: data.energie,
      immatriculation: data.immatriculation,
      dateDeVisite: data.dateDeVisite ? data.dateDeVisite.split('T')[0] : null,
      dateAcqui: data.dateAcqui ? data.dateAcqui.split('T')[0] : null,
      NumeroTelBalise: data.NumeroTelBalise,
      NumeroBalise: data.NumeroBalise,
      capacite: data.capacite,
      depotId: data.depot.id
    });
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._logistiqueService.DeleteVehicule(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.GetVehiculeList()
            this.toastr.success(res.message);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
}
