import {Component, ViewChild} from '@angular/core';
import {Table} from "primeng/table";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ArticleServiceService} from "../../../core/article-service.service";
import {FinanceService} from "../../../core/finance.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {ALERT_QUESTION} from "../../shared-component/utils";
import { Status } from 'src/app/utils/utils';

@Component({
  selector: 'app-ecart',
  templateUrl: './ecart.component.html',
  styleUrls: ['./ecart.component.scss']
})
export class EcartComponent {
  @ViewChild('dt2') dt2!: Table;
  filters = {
    commande: '',
    agent: '',
    client: '',
    statut: ''
  };
  amountReal: number=0;
  statuses!: any[];
  dataList!: any[];
  validatedPaiementForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  ListCLients: any = [];
  hstoriquePayment: any = [];
  currentPage: number;
  rowsPerPage: any;
  totalEmballage: number;
  totalLiquide: number;
  totalGlobal: number;
  totalQte: number;
  selectedArticles: never[];
  totalPages: number;

  constructor(
    private articleService: ArticleServiceService,
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.GetPaiementList(1);
  }

  filterGlobal() {
    this.GetPaiementList(
      1,
      this.filters.commande,
      this.filters.agent,
      this.filters.client,
      this.filters.statut
    );
  }
  OnEdit(data: any) {
    // this.GetHistoriquePayment(data.id)
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    // this.updateData.dateEchanceCalculer = calculeDateEcheance(
    //   data?.createdAt,
    //   data?.credit?.delaiReglement
    // );
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  OnCloseModal() {
    this.amountReal = 0
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isModalOpen = false;
    this.selectedArticles = [];
    console.log(this.isModalOpen);
  }
  GetPaiementList(page: number,numeroCommande?: string,agent?: string,clientNom?: string,statut?: string) {
    let data = {
      page: page,
      limit: 8,
      numeroCommande: numeroCommande || '',
      agent:agent || '',
      clientNom: clientNom || '',
      statut:statut || ''
    };
    this._spinner.show();
    this.financeService.GetCreanceList(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.totalPages = res.total// nombre total d’enregistrements

      this.dataList = res.data
      // .filter((item: any) => Number(item.montantPercu) > 0 && item.statut !== "Validé"

      // );
      console.log('DATA:::>', this.dataList);
      this._spinner.hide();
    });
  }

  ValidatePaiement() {
    let data = {
      "montant": this.amountReal
    }
    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous valider ce paiement ?'
    ).then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        console.log('validation:::>', data);
        this.financeService.ValidatePaiementEcart(data,this.updateData.id).then((res: any) => {
          if (res.statusCode == 201 || res.statusCode == 200) {
            this.GetPaiementList(1);
            this.toastr.success(res.message);
            this.OnCloseModal();
          } else {
            this.toastr.error(res.message);
          }
          this._spinner.hide();


        },(err) => {
          this._spinner.hide();
          this.toastr.error(err.message);
          console.log(err);
        });
      } else {
        res.isConfirmed == false;
      }
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPaiementList(this.currentPage)
  }


  protected readonly Status = Status;
}
