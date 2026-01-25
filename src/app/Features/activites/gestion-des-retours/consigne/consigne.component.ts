import {Component, ViewChild} from '@angular/core';
import {calculeDateEcheance} from "../../../../utils/utils";
import {Table} from "primeng/table";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ArticleServiceService} from "../../../../core/article-service.service";
import {FinanceService} from "../../../../core/finance.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-consigne',
  templateUrl: './consigne.component.html',
  styleUrls: ['./consigne.component.scss']
})
export class ConsigneComponent {

  @ViewChild('dt2') dt2!: Table;
  filters = {
    commande: '',
    agent: '',
    client: '',
    statut: ''
  };
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

  currentPage: number;
  rowsPerPage: any;
  totalEmballage: number;
  totalLiquide: number;
  totalGlobal: number;
  totalQte: number;
  selectedArticles: never[];
  totalPages: number;
  hstoriquePayment: any = [];
  constructor(
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.GetPaiementList(1);
  }
  GetHistoriquePayment(id: number) {
    this._spinner.show();
    this.financeService.GetHistoriquePayment(id).then((res: any) => {
      this.hstoriquePayment = res.data
      console.log('data:::>', res);
      this._spinner.hide();
    });
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
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
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
  isDateEchue(date: string | Date | null): boolean {
    if (!date) return false;

    const today = new Date();
    const targetDate = new Date(date);

    // On ignore l'heure : comparer uniquement les jours
    return targetDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  getEcartEnJours(dateEcheance: string | Date): number | null {
    if (!dateEcheance) return null;

    const dateEch = new Date(dateEcheance);
    const today = new Date();

    // On ignore les heures pour un écart "en jours entiers"
    dateEch.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - dateEch.getTime();
    const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffJours;
  }

  GetPaiementList(page: number,numeroCommande?: string,agent?: string,clientNom?: string,statut?: string) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      numeroCommande: numeroCommande || '',
      agent:agent || '',
      clientNom: clientNom || '',
      statut:statut || ''
    };
    this._spinner.show();
    this.financeService.GetConsigne(data).then((res: any) => {
      this.totalPages = res.total; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);

      this.dataList = res.data
      this.dataList = this.dataList.map(paiement => ({
        ...paiement,
        dateEchanceCalculer: calculeDateEcheance(paiement?.createdAt, paiement?.credit?.delaiReglement)
      }));
      //   .filter((item: any) =>
      //   item.statut === Status.ATTENTE && Number(item.montantPercu) >= 0
      // );
      console.log('ALL paiement en attente:::>',   this.dataList );

      this._spinner.hide();
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPaiementList(this.currentPage)
  }
  get filteredArticles() {
    return this.updateData.returnStock?.ventesReturn?.filter((a:any) => a.prixUnitaire > 0);
  }
  OnCloseModal() {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isModalOpen = false;
    this.selectedArticles = [];
    console.log(this.isModalOpen);
  }
}
