import {Component} from '@angular/core';
import {ArticleServiceService} from "../../../core/article-service.service";
import {FinanceService} from "../../../core/finance.service";
import {NgxSpinnerService} from "ngx-spinner";
import {FormBuilder} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {calculeDateEcheance} from "../../../utils/utils";

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

  isModalOpen = false;
  operation: string = '';
  updateData: any = {};
  isEditMode: boolean = false;
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
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  calculerTotalPaiements(transactions: any[]): number {
    let total = 0;
    for (const transaction of transactions) {
      if (transaction.paiements && transaction.paiements.length > 0) {
        for (const paiement of transaction.paiements) {
          total += paiement.montant || 0;
        }
      }
    }
    return total;
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

  ValiderPaiementGroup(item:any)
  {
    const interm:any = []
    console.log(item);
    item.forEach((iter:any) => {
      interm.push(iter.id)
    })
    let data = {
      "paiementIds":interm
    }
    this._spinner.show();
    this.financeService.ValiderPaiementGroup(data).then((res: any) => {
      if(res.statusCode === 200) {
        this.toastr.success(res.message);
      }else{
        this.toastr.error(res.message);
      }
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPaiementAgentList(this.currentPage)
  }
}
