import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ALERT_QUESTION } from '../../shared-component/utils';
import {LogistiqueService} from "../../../core/logistique.service";
import {ActivatedRoute} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-transporteur',
  templateUrl: './transporteur.component.html',
  styleUrls: ['./transporteur.component.scss']
})
export class TransporteurComponent {
  dataList = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  transporteurId: any;
  transporteurForm!: FormGroup;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  constructor(
    private toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private _logistiqueService:LogistiqueService
  ) {
    this.transporteurForm = this.fb.group({
      code: ['TRANS1234', [Validators.required]],
      codeApplication: ['TRANS1234', [Validators.required]],
      login: ['TRANS1234', [Validators.required]],
      nom: ['', [Validators.required]],
      prenoms: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^(\+?\d{1,3}[- ]?)?\d{10}$/)]]
    });
  }

  ngOnInit() {
    this.GetTransporteurList(1)
  }

  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || '';
    this.dt2.filterGlobal(value, 'contains');
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
    this.transporteurForm.reset()
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;

    // this.GetListTypePrix(this.currentPage);
  }

  GetTransporteurList(page: number) {
    this._spinner.show();
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._logistiqueService.GetTransporteurList(data).then((res: any) => {
      console.log('DATA:::>', res);
      this.totalPages = res.total * data.limit; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);

      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onSubmit(){
    if (this.isEditMode) {
      this._spinner.show();
      this._logistiqueService.UpdateTransporteur(this.transporteurId, this.transporteurForm.value).then((res:any) => {
          this._spinner.hide();
          this.isModalOpen = false;
          this.transporteurForm.reset()
          this.toastr.success(res.message);
          this.GetTransporteurList(1)
          console.log(res)
        },
        (error: any) => {
          this.isModalOpen = false;
          this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
          console.error('Erreur lors de la création', error);
        })
    } else {
      this._spinner.show();
      this._logistiqueService.CreateTransporteur(this.transporteurForm.value).then((res:any) => {
          this.GetTransporteurList(1)
          this.transporteurForm.reset()
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
    this.transporteurForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._logistiqueService.DeleteTransporteur(Id).then((res: any) => {
            console.log('DATA:::>', res);
            // this.dataList = res.data;
            this.GetTransporteurList(1)
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
}
