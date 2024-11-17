import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ventechinepage',
  templateUrl: './ventechinepage.component.html',
  styleUrls: ['./ventechinepage.component.scss']
})
export class VentechinepageComponent {
  groupeProduitForm!: FormGroup
  dataList:[]
  VenteForm:FormGroup
  loading: boolean = true;
  isModalOpen = false;
  operation:string = ''
  currentPage: number;
  rowsPerPage: any;
  constructor(private _spinner:NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,

  ) { }

  ngOnInit() {
    this.groupeProduitForm = this.fb.group({
      libelle: ['', Validators.required],
      code: ['', Validators.required],
    });
    this.VenteForm = this.fb.group({
      commercial: [null, Validators.required],
      zone: [null,  Validators.required],
      date: [null,  Validators.required],
      camion: [0,  Validators.required],
      produit: [0,  Validators.required],
      quantite: [0,  Validators.required],
    });
  }

  OnCloseModal()
  {
    this.isModalOpen = false;
    console.log(this.isModalOpen)
  }
  OnCreate()
  {
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen)
  }
  onSubmit()
  {}
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    // this.GetArticleList(this.currentPage);
  }

}
