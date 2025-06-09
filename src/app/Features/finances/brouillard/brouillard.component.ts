import { Component } from '@angular/core';
import {FinanceService} from "../../../core/finance.service";
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Observable} from "rxjs";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-brouillard',
  templateUrl: './brouillard.component.html',
  styleUrls:[ './brouillard.component.scss'],
  animations: [
    trigger('fadeOutUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      state('out', style({ opacity: 0, transform: 'translateY(-20px)' })),
      transition('in => out', animate('300ms ease-out')),
    ]),
    trigger('fadeInDown', [
      state('out', style({ opacity: 0, transform: 'translateY(-20px)' })),
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('out => in', animate('300ms ease-in')),
    ])
  ]
})
export class BrouillardComponent {
  filters = {
    nomDepot: ''
  };
  isCreating = false;
  rowsPerPage: number = 0;
  currentPage: number = 0;
  totalPages:any =0;
  dataList:any = []
  depenseForm: FormGroup;

  constructor(
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.depenseForm = this.fb.group({
      libelle: ['', Validators.required],
      montant: [null, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  ngOnInit() {
    setInterval(()=>
      this.RefreshBrouillard(1),10000)
    this.GetBrouillard(1);
  }
  onCancel(){
    this.isCreating = false;
  }
  OnCreate(){
    this.isCreating = true;
  }

  saveDepense(){
    console.log(this.depenseForm.value);
    this._spinner.show();
    this.financeService.SaveDepense(this.depenseForm.value).then((res: any) => {
    this.toastr.success('success', res.message);
      this.onCancel()
      this.GetBrouillard(1)
      this._spinner.hide();
    });
  }
  GetBrouillard(page: number,nomDepot?: string)
  {
    let data = {
      paginate: true,
      page: page,
      limit: 10,
    };
    this._spinner.show();
    this.financeService.GetBrouillard(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.totalPages = res.total; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);// nombre total d’enregistrements
      this.dataList = res.data[0].paiements
      console.log('Commande payees :::>', this.dataList );

      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetBrouillard(this.currentPage)
  }

  RefreshBrouillard(page: number,nomDepot?: string)
  {
    let data = {
      paginate: true,
      page: page,
      limit: 10,
    };
    this.financeService.GetBrouillard(data).then((res: any) => {
      this.totalPages = res.total; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);// nombre total d’enregistrements
      this.dataList = res.data[0].paiements
    });
  }
}
