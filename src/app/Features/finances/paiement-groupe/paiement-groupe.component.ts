import {Component} from '@angular/core';
import {ArticleServiceService} from "../../../core/article-service.service";
import {FinanceService} from "../../../core/finance.service";
import {NgxSpinnerService} from "ngx-spinner";
import {FormBuilder} from "@angular/forms";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-paiement-groupe',
  templateUrl: './paiement-groupe.component.html',
  styleUrls: ['./paiement-groupe.component.scss']
})
export class PaiementGroupeComponent {
  totalPages: any = [];
  dataList: any = [];
  currentPage: number
  rowsPerPage: number

  constructor(
    private articleService: ArticleServiceService,
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.GetPaiementAgentList(1)
  }
  OnEdit(data:any) {

  }

  GetPaiementAgentList(page: number, agent?: string) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      nomAgent: agent || ''
    };
    this._spinner.show();
    this.financeService.GetPaiementAgentList(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.totalPages = res.total// nombre total d’enregistrements

      this.dataList = res.data
      // .filter((item: any) => Number(item.montantPercu) > 0 && item.statut !== "Validé"

      // );
      console.log('DATA:::>', this.dataList);
      this._spinner.hide();
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPaiementAgentList(this.currentPage)
  }
}
