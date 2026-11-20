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
    statut: '',
    dateDebut: '',
    dateFin: '',
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
  vcFilters = { statut: '', type: '', search: '' };
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
    this.GetPaiementList(1);
  }

  resetFilters() {
    this.filters = { commande: '', agent: '', client: '', statut: '', dateDebut: '', dateFin: '' };
    this.GetPaiementList(1);
  }

  GetPaiementList(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      numeroCommande: this.filters.commande || '',
      agent: this.filters.agent || '',
      clientNom: this.filters.client || '',
      statut: this.filters.statut || '',
      dateDebut: this.filters.dateDebut || '',
      dateFin: this.filters.dateFin || '',
    };
    this._spinner.show();
    this.financeService.GetPaiementListAttente(data).then((res: any) => {
      this.totalPages = res.total; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);

      this.dataList = res.data.filter(
        (item: any) => item.montantAPercevoir > 0
      );
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
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
    this.GetPaiementList(this.currentPage);
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
  get filteredHistorique() {
    return this.hstoriquePayment.filter((item: any) => {
      const matchStatut = !this.vcFilters.statut || item?.statut === this.vcFilters.statut;
      const matchType   = !this.vcFilters.type   || item?.typePaiement === this.vcFilters.type;
      const q = this.vcFilters.search.toLowerCase();
      const matchSearch = !q ||
        (item?.numPaiement || '').toLowerCase().includes(q) ||
        String(item?.montant || '').includes(q) ||
        (item?.moyenPaiement?.libelle || '').toLowerCase().includes(q);
      return matchStatut && matchType && matchSearch;
    });
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
    this.vcFilters = { statut: '', type: '', search: '' };
    console.log(this.isModalOpen);
  }
  AnnulerTransaction(item: any) {
    ALERT_QUESTION('warning', 'Annuler ce paiement ?', 'Cette action est irréversible.').then((res) => {
      if (res.isConfirmed) {
        this._spinner.show();
        this.financeService.AnnulerPaiementTransaction(item.id).then((result: any) => {
          this._spinner.hide();
          this.toastr.success(result.message);
          this.GetHistoriquePayment(this.updateData.id);
          this.GetPaiementList(1);
        }).catch(() => {
          this._spinner.hide();
          this.toastr.error('Erreur lors de l\'annulation');
        });
      }
    });
  }

  ValidatePaiement(item: any) {
    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous valider ce paiement?'
    ).then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this.financeService.ValidatePaiement(item.id).then((res: any) => {
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

  downloadRecu(row: any) {
    this.financeService.getRecuPaiement(row.id).then((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-${row.numTransaction || row.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }).catch(() => this.toastr.error('Erreur lors du téléchargement du reçu'));
  }

  protected readonly Status = Status;
}
