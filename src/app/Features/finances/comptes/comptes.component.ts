import { Component } from '@angular/core';
import {FinanceService} from "../../../core/finance.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.scss']
})
export class ComptesComponent {
  filters = {
    depot: ''
  };
  isModalOpen:boolean = false;
  rowsPerPage: number = 0;
  currentPage: number = 0;
  totalPages:any =0;
  dataList:any = []
  updateData:any = []
  constructor(
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetComptes(1);
  }

  OnCloseModal(){
    this.isModalOpen = false;
  }
  OnViewDetail(data: any) {
    this.isModalOpen = true;
    this.updateData = data.paiements
  }
  GetComptes(page: number,depot?: string)
  {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      nomDepot: depot || '',
    };
    this._spinner.show();
    this.financeService.GetComptes(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.totalPages = res.total; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);// nombre total d’enregistrements

      this.dataList = res.data
      console.log('Commande payees :::>', this.dataList );

      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetComptes(this.currentPage)
  }
}
