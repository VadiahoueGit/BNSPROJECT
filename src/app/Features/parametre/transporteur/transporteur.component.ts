import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ALERT_QUESTION } from '../../shared-component/utils';

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
  constructor(
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {}



  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || '';
    this.dt2.filterGlobal(value, 'contains');
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  onSubmit(){}
  
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
