import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import {FinanceService} from "../../../core/finance.service";
import {Status} from "../../../utils/utils";

@Component({
  selector: 'app-commande-payes-partiellement',
  templateUrl: './commande-payes-partiellement.component.html',
  styleUrls: ['./commande-payes-partiellement.component.scss']
})
export class CommandePayesPartiellementComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  hstoriquePayment:any []
  ArticleForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  constructor(
    private articleService: ArticleServiceService,
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {

    this.GetPaiementList(1);
  }

  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.GetHistoriquePayment(data.id)
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetPaiementList(page:number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.financeService.GetPaiementList(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.totalPages = res.total * data.limit; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages); // nombre total d’enregistrements

      this.dataList = res.data.filter((item: any) =>
        item.statut === Status.VALIDE && Number(item.montantPercu) > 0 && Number(item.montantPercu) < Number(item.montantAPercevoir)

      );
      console.log('Commande payees partiellement:::>', this.dataList );
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
  }
  onSubmit(): void {

  }

  GetHistoriquePayment(id: number)
  {
    this._spinner.show();
    this.financeService.GetHistoriquePayment(id).then((res: any) => {
      this.hstoriquePayment = res.data
      console.log('data:::>', res);
      this._spinner.hide();
    });
  }
}
