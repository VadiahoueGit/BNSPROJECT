import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { FinanceService } from '../../../core/finance.service';
import {calculeDateEcheance, Status} from "../../../utils/utils";

@Component({
  selector: 'app-paiementenattente',
  templateUrl: './paiementenattente.component.html',
  styleUrls: ['./paiementenattente.component.scss']
})
export class PaiementenattenteComponent {
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

  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
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
    this.financeService.GetPaiementListAttente(data).then((res: any) => {
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

  isDateEchue(date: string | Date | null): boolean {
    if (!date) return false;

    const today = new Date();
    const targetDate = new Date(date);

    // On ignore l'heure : comparer uniquement les jours
    return targetDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }


  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPaiementList(this.currentPage)
  }

  loadArticleDetails(): void {
    this.validatedPaiementForm.patchValue({
      photo: this.updateData.photo ?? '',
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      Conditionnement: this.updateData.Conditionnement,
      categorieId: this.updateData.categorieproduit.id,
      groupeId: this.updateData.groupearticle.id,
      plastiquenuId: this.updateData.plastiquenu.id,
      bouteillevideId: this.updateData.bouteillevide.id,
      liquideId: 1,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
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
  ValidatePaiement(id: number) {
    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous valider ce paiement?'
    ).then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this.financeService.ValidatePaiement(id).then((res: any) => {
          console.log('validation:::>', res);
          this._spinner.hide();
          this.GetPaiementList(1);

          this.OnCloseModal();

          this.toastr.success(res.message);
        });
      } else {
        this.isModalOpen = false;
      }
    });
  }
}
