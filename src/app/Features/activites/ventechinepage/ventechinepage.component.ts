import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ventechinepage',
  templateUrl: './ventechinepage.component.html',
  styleUrls: ['./ventechinepage.component.scss']
})
export class VentechinepageComponent {
  VenteForm:FormGroup
  dataList:[]
  commercial:[]
  zone:[]
  camion:[]
  produit:[]
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  private fb: FormBuilder
  ngOnInit() {
    this.VenteForm = this.fb.group({
      commercial: [null, Validators.required],
      zone: [null,  Validators.required],
      date: [null,  Validators.required],
      camion: [0,  Validators.required],
      produit: [0,  Validators.required],
      quantite: [0,  Validators.required],
    });
  }
  OnEdit(data:any){}
  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
}
