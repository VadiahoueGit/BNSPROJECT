import { Component } from '@angular/core';
import {FinanceService} from "../../../core/finance.service";
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {Observable} from "rxjs";

@Component({
  selector: 'app-brouillard',
  templateUrl: './brouillard.component.html',
  styleUrls:[ './brouillard.component.scss']
})
export class BrouillardComponent {
  filters = {
    nomDepot: ''
  };
  rowsPerPage: number = 0;
  currentPage: number = 0;
  totalPages:any =0;
  dataList:any = []
  constructor(
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetBrouillard(1);
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
}
