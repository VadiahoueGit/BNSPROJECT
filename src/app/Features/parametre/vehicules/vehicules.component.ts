import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { LogistiqueService } from 'src/app/core/logistique.service';

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
  transporteurId: any;
  chauffeurs=[{ id: 1, name: 'Volvo' },
  { id: 2, name: 'Saab' },
  { id: 3, name: 'Opel' },
  { id: 4, name: 'Audi' },]
  vehicleForm!: FormGroup;
  constructor(
    private _logistiqueService:LogistiqueService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {
    this.vehicleForm = this.fb.group({
      numero: [null, Validators.required],
      marque: [null, Validators.required],
      energie: [null, Validators.required],
      immatriculation: [null, Validators.required],
      dateDeVisite: [null, Validators.required],
      dateAcqui: [null, Validators.required],
      NumeroTelBalise: [0, Validators.required],
      NumeroBalise: [0, Validators.required],
      capacite: [0, Validators.required],
      chauffeurId: [0, Validators.required]
    });
    
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
  onSubmit(){
    this._logistiqueService.CreateVehicule(this.vehicleForm.value).then((res)=>{
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
    this.transporteurId = data.id;
    this.vehicleForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          // this.articleService.DeletePrix(Id).then((res: any) => {
          //   console.log('DATA:::>', res);
          //   // this.dataList = res.data;
          //   this._spinner.hide();
          // });
        } else {
        }
      }
    );
  }
}
