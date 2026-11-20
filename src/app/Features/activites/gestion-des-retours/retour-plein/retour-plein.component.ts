import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION, ALERT_INFO } from 'src/app/Features/shared-component/utils';
import {ActiviteService} from "../../../../core/activite.service";
import {CoreServiceService} from "../../../../core/core-service.service";
import {StatutCommande, isAdminRole, isDepotHote} from "../../../../utils/utils";
@Component({
  selector: 'app-retour-plein',
  templateUrl: './retour-plein.component.html',
  styleUrls: ['./retour-plein.component.scss']
})
export class RetourPleinComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  ArticleForm!:FormGroup
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number = 0;
  filters: any = { numRetour: '', dateDebut: '', dateFin: '', client: '', statut: '', agent: '', typeRetour: '', depotId: null };
  isHote = isDepotHote();
  depotList: any[] = [];
  constructor(
    private activiteService: ActiviteService,
    private articleService: ArticleServiceService,
    private coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetRetourPleinList(1);
    this.loadDepotList();
  }

  loadDepotList() {
    if (!this.isHote) return;
    this.coreService.GetDepotList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  onFilterGlobal(event: Event) {
    this.filters.numRetour = (event.target as HTMLInputElement).value;
    this.resetPaginator();
    this.GetRetourPleinList(1);
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

  OnEdit(data:any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.updateData.articles.forEach((item: any) => {
      if (item.quantiteReelle == null && data.statut !== 'Validé') {
        item.quantiteReelle = item.quantite;
      }
      // Un 0 affiché dans le champ physique est ambigu : on ne sait pas si l'agent l'a
      // vérifié ou n'a simplement rien saisi. On vide le champ pour forcer une saisie explicite.
      if (item.quantiteReelle === 0 && data.statut !== 'Validé') {
        item.quantiteReelle = null;
      }
    });
    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';

    console.log(this.isModalOpen);
  }
  filterGlobal() {
    console.log('filtres:', this.filters);
    this.resetPaginator();
    this.GetRetourPleinList(1);
  }

  resetFilters() {
    this.filters = { numRetour: '', dateDebut: '', dateFin: '', client: '', statut: '', agent: '', typeRetour: '', depotId: null };
    this.resetPaginator();
    this.GetRetourPleinList(1);
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.numRetour || this.filters.client || this.filters.statut
      || this.filters.dateDebut || this.filters.dateFin || this.filters.agent
      || this.filters.typeRetour || this.filters.depotId);
  }

  resetPaginator() {
    if (this.dt2) this.dt2.first = 0;
  }

  GetRetourPleinList(page:any) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      numRetour: this.filters.numRetour || '',
      dateDebut: this.filters.dateDebut || '',
      dateFin: this.filters.dateFin || '',
      client: this.filters.client || '',
      statut: this.filters.statut || '',
      agent: this.filters.agent || '',
      typeRetour: this.filters.typeRetour || '',
      depotId: this.filters.depotId || '',
    };
    this._spinner.show();
    this.activiteService.GetRetourPleinList(data).then((res: any) => {
      this.dataList = res.data;
      this.totalPages = res.total;
      this._spinner.hide();
    });
  }
  get filteredArticles() {
    return this.updateData.articles?.filter((a:any) => a.prixUnitaire > 0);
  }
  get isPhysiqueComplete(): boolean {
    const articles = this.updateData?.articles || [];
    if (!articles.length) return false;
    return articles.every((a: any) => a.quantiteReelle !== null && a.quantiteReelle !== undefined && a.quantiteReelle !== '');
  }
  onQuantiteReelleChange(item: any) {
    const quantiteReelle = item.quantiteReelle === null || item.quantiteReelle === undefined || item.quantiteReelle === ''
      ? 0
      : Number(item.quantiteReelle);
    item.ecart = quantiteReelle - Number(item.quantite);
  }

  private calculerTotalEcart(articles: any[]): number {
    return (articles || []).reduce((s: number, a: any) => {
      const montant = Math.abs(Number(a.ecart || 0)) * (Number(a.prixUnitaireLiquide || 0) + Number(a.prixUnitaireEmballage || 0));
      return s + montant;
    }, 0);
  }

  async ValidateReturn(item:any){
    const totalEcart = this.calculerTotalEcart(item.articles);
    if (totalEcart > 0) {
      await ALERT_INFO(
        'info',
        'Écart détecté',
        `La quantité physique saisie ne correspond pas à la quantité théorique pour un ou plusieurs articles. Écart estimé : ${totalEcart.toLocaleString()} FCFA. Un écart de paiement sera créé pour ce montant à la validation.`,
      );
    }

    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous valider ce retour?'
    ).then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        let data = {
          "articlesRecus": item.articles.map((a: any) => ({
            id: a.id,
            quantiteReelle: a.quantiteReelle,
            type: a.isFree == true ? "GRATUIT" : "PAYANT"
          }))
        }
        this.activiteService.ValidateRetourPlein(item.id,data).then((res: any) => {
          this.dataList = res.data;
          this.GetRetourPleinList(1)
          this.OnCloseModal();
          console.log('validation:::>', this.dataList);
          this._spinner.hide();
          this.toastr.success(res.message);
        }).catch((err: any) => {
          this._spinner.hide();
          this.toastr.error(err?.error?.message || 'Erreur lors de la validation du retour plein.');
        });

      } else {
        this.isModalOpen = false;
      }
    });

  }

  isAdmin(): boolean {
    return isAdminRole();
  }

  async AnnulerValidation(item: any) {
    const totalEcart = this.calculerTotalEcart(item.articles);

    if (totalEcart > 0) {
      await ALERT_INFO(
        'info',
        'Écart détecté sur ce retour',
        `Ce retour a généré un écart d'environ ${totalEcart.toLocaleString()} FCFA. L'annulation de la validation supprimera cet écart (et annulera tout paiement enregistré contre lui) et restituera le crédit et le stock. Le retour repassera en attente pour resaisie de l'inventaire.`,
      );
    }

    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous vraiment annuler la validation de ce retour plein ?'
    ).then((res: any) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this.activiteService.AnnulerValidationRetourPlein(item.id).then((res: any) => {
          this._spinner.hide();
          this.toastr.success(res.message);
          this.GetRetourPleinList(1);
          this.OnCloseModal();
        }).catch((err: any) => {
          this._spinner.hide();
          this.toastr.error(err?.error?.message || 'Erreur lors de l\'annulation de la validation.');
        });
      }
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetRetourPleinList(this.currentPage)
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res:any) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetRetourPleinList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  protected readonly StatutCommande = StatutCommande;
}
