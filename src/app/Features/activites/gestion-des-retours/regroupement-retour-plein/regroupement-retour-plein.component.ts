import { Component, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ActiviteService } from '../../../../core/activite.service';
import { CoreServiceService } from '../../../../core/core-service.service';
import { ArticleServiceService } from '../../../../core/article-service.service';
import { ALERT_QUESTION, ALERT_INFO } from 'src/app/Features/shared-component/utils';
import { isDepotHote } from '../../../../utils/utils';

@Component({
  selector: 'app-regroupement-retour-plein',
  templateUrl: './regroupement-retour-plein.component.html',
  styleUrls: ['./regroupement-retour-plein.component.scss']
})
export class RegroupementRetourPleinComponent {
  @ViewChild('dt2') dt2!: Table;
  dataList: any[] = [];
  totalPages: number = 0;
  isModalOpen = false;
  updateData: any = {};
  allArticles: any[] = [];
  dates: { firstDate: Date, lastDate: Date } | null = null;
  currentPage: number = 1;

  filters: any = { numero: '', agent: '', statut: '', dateDebut: '', dateFin: '', depotId: null };
  isHote = isDepotHote();
  depotList: any[] = [];

  // ===== Ajout manuel d'un article absent des quantités théoriques =====
  isAddArticleOpen = false;
  articlePickerList: any[] = [];
  filteredArticlePickerList: any[] = [];
  articlePickerSearch = '';
  selectedArticleToAdd: any = null;
  newArticleQuantite: number | null = null;

  constructor(
    private _activite: ActiviteService,
    private coreService: CoreServiceService,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.GetRegroupementList(1);
    this.loadDepotList();
  }

  loadDepotList() {
    if (!this.isHote) return;
    this.coreService.GetDepotList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  filterGlobal() {
    this.resetPaginator();
    this.GetRegroupementList(1);
  }

  resetFilters() {
    this.filters = { numero: '', agent: '', statut: '', dateDebut: '', dateFin: '', depotId: null };
    this.resetPaginator();
    this.GetRegroupementList(1);
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.numero || this.filters.agent || this.filters.statut
      || this.filters.dateDebut || this.filters.dateFin || this.filters.depotId);
  }

  resetPaginator() {
    if (this.dt2) this.dt2.first = 0;
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.GetRegroupementList(this.currentPage);
  }

  GetRegroupementList(page: number): Promise<void> {
    const data = {
      paginate: true,
      page,
      limit: 8,
      numero: this.filters.numero || '',
      agent: this.filters.agent || '',
      statut: this.filters.statut || '',
      dateDebut: this.filters.dateDebut || '',
      dateFin: this.filters.dateFin || '',
      depotId: this.filters.depotId || '',
    };
    this._spinner.show();
    return this._activite.GetRetourPleinRegroupementList(data).then((res: any) => {
      this.dataList = res.data || [];
      this.totalPages = res.total || 0;
      this._spinner.hide();
    }).catch(() => { this._spinner.hide(); });
  }

  OnEdit(row: any) {
    this.updateData = { ...row, retours: [], inventaires: [] };
    this._spinner.show();
    this._activite.GetGroupDetailRetourPlein(row.regroupementId).then((res: any) => {
      const retours = res.data?.retours ?? [];
      const inventaires = res.data?.regroupement?.inventaires ?? [];
      this.updateData = { ...row, retours, inventaires };
      this.dates = this.getFirstAndLastDate(retours);
      this.extractAllArticles(retours);
      if (inventaires.length > 0) {
        this.preloadInventaire(inventaires);
      }
      this._spinner.hide();
      this.isModalOpen = true;
    }).catch(() => {
      this._spinner.hide();
      this.isModalOpen = true;
    });
  }

  preloadInventaire(inventaires: any[]) {
    for (const inv of inventaires) {
      const article = this.allArticles.find((a: any) => a.typeArticle === inv.typeArticle && a.codeArticle === inv.codeArticle);
      if (article) {
        article.receivedQuantity = inv.receivedQuantity;
        article.expectedQuantity = inv.expectedQuantity;
      }
    }
  }

  OnCloseModal() {
    this.isModalOpen = false;
  }

  articlesLabel(retour: any): string {
    return (retour.articles || [])
      .map((a: any) => `${a.liquide?.libelle || a.emballage?.libelle || 'Article'} x${a.quantite}`)
      .join(', ');
  }

  getFirstAndLastDate<T extends { createdAt: string }>(items: T[]): { firstDate: Date, lastDate: Date } | null {
    if (!items || items.length === 0) return null;
    const firstDate = new Date(items[items.length - 1].createdAt);
    const lastDate = new Date(items[0].createdAt);
    return { firstDate, lastDate };
  }

  // Un article de retour plein porte à la fois un liquide ET son emballage (une bouteille
  // pleine + son casier) : on les sépare en deux lignes distinctes pour l'inventaire, comme
  // deux articles indépendants à compter physiquement.
  extractAllArticles(retours: any[]) {
    const articleMap = new Map<string, any>();
    // La COLONNE (l'article lui-même) doit exister pour tout retour du regroupement, validé ou
    // non — sinon un regroupement entièrement "Validé" n'a plus aucune colonne et le tableau
    // pivot disparaît complètement. Seul le cumul "Total théorique" (expectedQuantity) ne doit
    // couvrir que ce qui reste réellement à inventorier : les retours déjà "Validé" (comptés lors
    // d'un cycle d'inventaire précédent) ou "Refusé" (jamais attendus) ne doivent pas gonfler
    // l'attendu — même périmètre que createManyInventaireRetourPlein côté backend, qui ne valide
    // que les retours "En attente".
    (retours || []).forEach((retour: any) => {
      const compteDansTotal = retour.statut === 'En attente';
      (retour.articles || []).forEach((article: any) => {
        if (article.liquide?.code) {
          const key = 'LIQUIDE-' + article.liquide.code;
          if (!articleMap.has(key)) {
            articleMap.set(key, {
              libelle: article.liquide.libelle, typeArticle: 'LIQUIDE', codeArticle: article.liquide.code,
              expectedQuantity: 0, receivedQuantity: null, prixUnitaire: 0,
            });
          }
          if (compteDansTotal) articleMap.get(key).expectedQuantity += Number(article.quantite || 0);
          if (article.prixUnitaireLiquide) articleMap.get(key).prixUnitaire = Number(article.prixUnitaireLiquide);
        }
        if (article.emballage?.code) {
          const key = 'EMBALLAGE-' + article.emballage.code;
          if (!articleMap.has(key)) {
            articleMap.set(key, {
              libelle: article.emballage.libelle, typeArticle: 'EMBALLAGE', codeArticle: article.emballage.code,
              expectedQuantity: 0, receivedQuantity: null, prixUnitaire: 0,
            });
          }
          if (compteDansTotal) articleMap.get(key).expectedQuantity += Number(article.quantite || 0);
          if (article.prixUnitaireEmballage) articleMap.get(key).prixUnitaire = Number(article.prixUnitaireEmballage);
        }
      });
    });
    this.allArticles = Array.from(articleMap.values());
    // La colonne emballage n'est plus affichée/saisie manuellement dans ce tableau (l'emballage
    // suit automatiquement le liquide correspondant : un casier revient forcément avec ses
    // bouteilles) — mais son stock doit quand même être crédité normalement à l'enregistrement
    // de l'inventaire, sans écart : on aligne donc sa quantité physique sur la théorique dès
    // l'extraction, pour ne jamais bloquer la validation ni générer un faux écart.
    this.allArticles.forEach((a: any) => {
      if (a.typeArticle === 'EMBALLAGE') a.receivedQuantity = a.expectedQuantity;
    });
  }

  // Colonnes réellement affichées dans le tableau pivot : les emballages "automatiques" (issus
  // des retours) sont masqués (cf. extractAllArticles) — seuls les liquides et les articles
  // ajoutés manuellement (isManual, quel que soit leur type) restent visibles.
  get visibleArticles(): any[] {
    return (this.allArticles || []).filter((a: any) => a.typeArticle === 'LIQUIDE' || a.isManual);
  }

  getQuantity(retour: any, article: any): number {
    let total = 0;
    (retour.articles || []).forEach((a: any) => {
      if (article.typeArticle === 'LIQUIDE' && a.liquide?.code === article.codeArticle) total += Number(a.quantite || 0);
      if (article.typeArticle === 'EMBALLAGE' && a.emballage?.code === article.codeArticle) total += Number(a.quantite || 0);
    });
    return total;
  }

  get inventaireComplet(): boolean {
    return this.allArticles?.length > 0 &&
      this.allArticles.every((a: any) => a.receivedQuantity !== null && a.receivedQuantity !== undefined);
  }

  private calculerTotalEcart(articles: any[]): number {
    return (articles || []).reduce((s: number, a: any) => {
      const ecart = Number(a.receivedQuantity || 0) - Number(a.expectedQuantity || 0);
      return s + Math.abs(ecart) * Number(a.prixUnitaire || 0);
    }, 0);
  }

  TerminerRegroupement(data: any) {
    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous clôturer ce regroupement ? Aucun nouveau retour ne pourra plus y être ajouté.'
    ).then((res) => {
      if (res.isConfirmed === true) {
        this._spinner.show();
        this._activite.TerminerRegroupementRetourPlein(data.regroupementId).then((res: any) => {
          this._spinner.hide();
          this.toastr.success(res.message || 'Regroupement clôturé avec succès.');
          this.OnCloseModal();
          this.GetRegroupementList(this.currentPage);
        }).catch((err: any) => {
          this._spinner.hide();
          this.toastr.error(err?.error?.message || 'Erreur lors de la clôture du regroupement.');
        });
      }
    });
  }

  // ===== Ajout manuel d'un article (liquide/emballage) absent des quantités théoriques =====
  // Le magasinier peut trouver physiquement un article qui ne figurait dans AUCUN bordereau de
  // retour de ce regroupement (donc absent de allArticles, quantité théorique inexistante). On
  // l'ajoute comme une colonne à part, avec expectedQuantity = receivedQuantity au moment de
  // l'enregistrement (voir TerminerInventaire) : il n'y a rien à comparer pour un article qui
  // n'était pas attendu, donc pas d'écart à générer, et le stock est bien crédité de la quantité
  // trouvée (le backend crédite le stock sur expectedQuantity, cf. retour-plein.service.ts).
  get canAddArticle(): boolean {
    return this.updateData?.inventaires?.length === 0 && this.updateData?.regroupementStatut === 'Inventaire';
  }

  openAddArticle() {
    this.isAddArticleOpen = true;
    this.selectedArticleToAdd = null;
    this.newArticleQuantite = null;
    this.articlePickerSearch = '';
    if (this.articlePickerList.length === 0) {
      this.loadArticlePickerList();
    } else {
      this.filterArticlePicker();
    }
  }

  closeAddArticle() {
    this.isAddArticleOpen = false;
  }

  loadArticlePickerList() {
    this._spinner.show();
    Promise.all([
      this.articleService.GetLiquideList({ paginate: false, page: 1, limit: 0 }),
      this.articleService.GetEmballageList({ paginate: false, page: 1, limit: 0 }),
    ]).then(([liquideRes, emballageRes]: any[]) => {
      const liquides = (liquideRes.data || []).map((l: any) => ({ code: l.code, libelle: l.libelle, type: 'Liquide', typeArticle: 'LIQUIDE' }));
      const emballages = (emballageRes.data || []).map((e: any) => ({ code: e.code, libelle: e.libelle, type: 'Emballage', typeArticle: 'EMBALLAGE' }));
      this.articlePickerList = [...liquides, ...emballages];
      this.filterArticlePicker();
    }).finally(() => this._spinner.hide());
  }

  filterArticlePicker() {
    const term = (this.articlePickerSearch || '').toLowerCase().trim();
    const existingCodes = new Set((this.allArticles || []).map((a: any) => a.codeArticle));
    this.filteredArticlePickerList = this.articlePickerList.filter((a: any) =>
      !existingCodes.has(a.code) &&
      (!term || (a.code || '').toLowerCase().includes(term) || (a.libelle || '').toLowerCase().includes(term))
    );
  }

  confirmAddArticle() {
    if (!this.selectedArticleToAdd) {
      this.toastr.warning('Sélectionnez un article.');
      return;
    }
    if (this.newArticleQuantite === null || this.newArticleQuantite === undefined || Number(this.newArticleQuantite) <= 0) {
      this.toastr.warning('Saisissez une quantité valide.');
      return;
    }
    const item = this.selectedArticleToAdd;
    this.allArticles.push({
      libelle: item.libelle,
      typeArticle: item.typeArticle,
      codeArticle: item.code,
      expectedQuantity: 0,
      receivedQuantity: Number(this.newArticleQuantite),
      isManual: true,
    });
    this.isAddArticleOpen = false;
  }

  removeManualArticle(article: any) {
    this.allArticles = this.allArticles.filter((a: any) => a !== article);
  }

  async TerminerInventaire(datas: any, items: any[]) {
    // Pour les articles ajoutés manuellement (isManual), il n'y a pas de quantité théorique à
    // proprement parler : on aligne expectedQuantity sur la quantité physique saisie juste avant
    // l'enregistrement (qui a pu être modifiée depuis l'ajout), pour ne pas générer d'écart
    // fictif et pour que le stock soit correctement crédité (le backend crédite sur
    // expectedQuantity).
    items.forEach((article: any) => {
      if (article.isManual) {
        article.expectedQuantity = Number(article.receivedQuantity) || 0;
      }
    });
    const inventories = items.map((article: any) => ({
      typeArticle: article.typeArticle,
      codeArticle: article.codeArticle,
      expectedQuantity: article.expectedQuantity,
      receivedQuantity: article.receivedQuantity,
    }));

    const totalEcart = this.calculerTotalEcart(items);
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
      'Voulez-vous valider cet inventaire ?'
    ).then((res) => {
      if (res.isConfirmed === true) {
        this._spinner.show();
        this._activite.CreateInventaireRetourPlein(datas.regroupementId, inventories).then((res: any) => {
          this._spinner.hide();
          this.isModalOpen = false;
          this.GetRegroupementList(this.currentPage);
          this.toastr.success(res.message);
        }).catch((err: any) => {
          this._spinner.hide();
          this.toastr.error(err?.error?.message || "Erreur lors de l'enregistrement de l'inventaire.");
        });
      }
    });
  }

  async AnnulerInventaire(datas: any) {
    const totalEcart = this.calculerTotalEcart(this.allArticles);
    if (totalEcart > 0) {
      await ALERT_INFO(
        'info',
        'Écart détecté sur cet inventaire',
        `Cet inventaire a généré un écart d'environ ${totalEcart.toLocaleString()} FCFA. L'annulation supprimera cet écart (et annulera tout paiement enregistré contre lui) et restituera le crédit et le stock. Le regroupement repassera en attente pour resaisie de l'inventaire.`,
      );
    }

    ALERT_QUESTION(
      'warning',
      'Attention !',
      "Voulez-vous annuler cet inventaire ? Le stock, le crédit client et le statut des retours seront restaurés."
    ).then((res) => {
      if (res.isConfirmed === true) {
        this._spinner.show();
        this._activite.AnnulerInventaireRetourPlein(datas.regroupementId).then((res: any) => {
          this._spinner.hide();
          this.isModalOpen = false;
          this.GetRegroupementList(this.currentPage);
          this.toastr.success(res.message);
        }, (error: any) => {
          this._spinner.hide();
          this.toastr.error(error?.error?.message || "Erreur lors de l'annulation de l'inventaire.");
        });
      }
    });
  }
}
