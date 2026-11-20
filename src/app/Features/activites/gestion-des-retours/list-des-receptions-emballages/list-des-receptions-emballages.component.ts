import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {CoreServiceService} from 'src/app/core/core-service.service';
import {ALERT_QUESTION, ALERT_INFO} from 'src/app/Features/shared-component/utils';
import {ActiviteService} from "../../../../core/activite.service";
import {data} from "jquery";
import {Status, isDepotHote} from "../../../../utils/utils";

@Component({
  selector: 'app-list-des-receptions-emballages',
  templateUrl: './list-des-receptions-emballages.component.html',
  styleUrls: ['./list-des-receptions-emballages.component.scss']
})
export class ListDesReceptionsEmballagesComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any;
  allArticles: any
  totalPages: number = 0;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  cargaison: number = 0;
  isEditMode: boolean = false;
  dates: any;
  ramassageList: any[] = [];
  regroupementTable: any[] = [];
  regroupementFinal: {
    [key: string]: Array<{ type: string; palettes: number; casier: number; totalQuantite: number; fournisseurNom?: string | null }>
  } = {};
  result: { palettes: number; casier: number } | null = null;
  casiersPerPalette: Record<number, { casiers: number; type: string; fournisseurId: number | null; fournisseurNom: string | null }[]> = {};
  currentPage: number = 1;
  rowsPerPage: any;
  searchTerm: string = '';

  filters: any = { numero: '', agent: '', contact: '', fonction: '', statut: '', dateDebut: '', dateFin: '', dateInventaire: '', depotId: null };
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
    private _coreService: CoreServiceService,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.GetRetourList(1);
    this.LoadCasiersPerPalette();
    this.loadDepotList();
  }

  loadDepotList() {
    if (!this.isHote) return;
    this._coreService.GetDepotList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  LoadCasiersPerPalette() {
    this._coreService.GetReglePaletteList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.casiersPerPalette = {};
      (res.data as any[]).forEach(regle => {
        if (!this.casiersPerPalette[regle.format]) {
          this.casiersPerPalette[regle.format] = [];
        }
        this.casiersPerPalette[regle.format].push({ casiers: regle.casiers, type: regle.type, fournisseurId: regle.fournisseur?.id ?? null, fournisseurNom: regle.fournisseur?.nom ?? null });
      });
    });
  }

  findRegle(format: number, type: string, fournisseurId?: number): { casiers: number; fournisseurNom: string | null } {
    const rules = this.casiersPerPalette[format] ?? [];
    let rule: any = null;
    if (fournisseurId) {
      rule = rules.find((r: any) => r.type === type && r.fournisseurId === fournisseurId);
    }
    if (!rule) rule = rules.find((r: any) => r.type === type && !r.fournisseurId);
    if (!rule) rule = rules.find((r: any) => r.type === type);
    return { casiers: rule?.casiers ?? 0, fournisseurNom: rule?.fournisseurNom ?? null };
  }


  filterGlobal() {
    this.resetPaginator();
    this.GetRetourList(1);
  }

  resetFilters() {
    this.filters = { numero: '', agent: '', contact: '', fonction: '', statut: '', dateDebut: '', dateFin: '', dateInventaire: '', depotId: null };
    this.resetPaginator();
    this.GetRetourList(1);
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.numero || this.filters.agent || this.filters.contact || this.filters.fonction
      || this.filters.statut || this.filters.dateDebut || this.filters.dateFin
      || this.filters.dateInventaire || this.filters.depotId);
  }

  resetPaginator() {
    if (this.dt2) this.dt2.first = 0;
  }

  clear(table: Table) {
    table.clear();
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.console.log(data)
    this.updateData = { ...data, retours: [] };
    this._spinner.show();
    const key = data._groupKey ?? {};
    this._activite.GetGroupDetail(key.regId ?? null, key.transporteurId ?? null, key.commercialId ?? null)
      .then((res: any) => {
        this.updateData = { ...data, retours: res.data?.retours ?? [] };
        this.dates = this.getFirstAndLastDate(this.updateData.retours);
        this.extractAllArticles(this.updateData.retours);
        if (this.updateData.inventaires?.length > 0) {
          this.preloadInventaire(this.updateData.inventaires);
        }
        this._spinner.hide();
        this.isModalOpen = true;
      })
      .catch(() => {
        this._spinner.hide();
        this.isModalOpen = true;
      });
  }

  get filteredArticles() {
    return this.updateData?.retours?.articles?.filter((a:any) => a.prixUnitaire > 0);
  }
  calculate(commande: any): void {
    console.log('Commande:', commande);

    this.regroupementFinal = {};
    this.result = {palettes: 0, casier: 0};

    const articlesParFormatEtType = commande.articles.reduce((acc: any, article: any) => {
      const format = Number(article?.produit?.format);
      const type: string = article?.produit.groupearticle?.libelle;
      console.log('type:', article?.produit.groupearticle?.libelle);
      if (!format || !type) {
        console.log('format:', format);
        console.log('type:', type);
        console.warn('Article sans format ou type non défini, ignoré:', article);
        return acc;
      }

      if (!acc[format]) {
        acc[format] = {};
      }

      if (!acc[format][type]) {
        acc[format][type] = [];
      }

      acc[format][type].push(article);
      return acc;
    }, {});

    console.log('Articles regroupés par format et type:', articlesParFormatEtType);

    Object.keys(articlesParFormatEtType).forEach((formatStr: string) => {
      const format = Number(formatStr);
      const totalCasiersParFormat: any = {};

      Object.entries(articlesParFormatEtType[format]).forEach(([type, articles]: [string, any]) => {
        const totalCasiers = articles.reduce(
          (total: number, article: any) => total + Number(article.quantity || 0),
          0
        );

        const fournisseurId = articles[0]?.produit?.fournisseur?.id ?? undefined;
        const regle = this.findRegle(format, type, fournisseurId);
        if (!regle.casiers) {
          console.warn(`Aucune règle palette pour format ${format} / type ${type}`);
          return;
        }

        const palettes = Math.floor(totalCasiers / regle.casiers);
        const casier = totalCasiers % regle.casiers;

        if (!this.regroupementFinal[format]) {
          this.regroupementFinal[format] = [];
        }

        const existingEntry = this.regroupementFinal[format].find((entry: any) => entry.type === type);
        if (existingEntry) {
          existingEntry.palettes += palettes;
          existingEntry.casier += casier;
        } else {
          this.regroupementFinal[format].push({ type, palettes, casier, totalQuantite: 0, fournisseurNom: regle.fournisseurNom });
        }
      });
    });
// Recalcul de la cargaison après modification de regroupementFinal
    console.log('Résultat final:', this.regroupementFinal);
  }


  regrouperArticles(articles: any[]): any {
    let articlesRegroupes: any = [];
    let montantTotal = 0;
    console.log('Regroupement par format:', articles);
    // Parcours de toutes les commandes
    articles.forEach((article: any) => {
      articlesRegroupes.push(article);
      montantTotal += parseFloat(article.montantEmballage);
    })

    return {
      articles: articlesRegroupes,
      montantTotal: montantTotal
    };
  }

  PrintDoc(item: any) {
    console.log(item);
    this.regroupementTable = [];
    const idretour = item.id;
    let allArticles = item.retours.flatMap((retour: any) => retour.articles.filter((article: any) => article.prixUnitaire > 0));
    console.log('allArticles', allArticles);
    let regroup = this.regrouperArticles(allArticles)
    this.calculate(regroup);
    this._spinner.show();
    if (this.regroupementFinal) {
      const result = Object.entries(this.regroupementFinal).flatMap(([key, value]) => {
        // Vérifie que value est bien un tableau
        if (!Array.isArray(value)) return [];

        // Regroupement par type
        const regroupementParType = value.reduce((acc, item) => {
          const type = item.type ?? "Inconnu"; // Sécurité si le type est absent
          if (!acc[type]) {
            acc[type] = {casier: 0, palette: 0};
          }
          acc[type].casier += item.casier ?? 0;
          acc[type].palette += item.palettes ?? 0;
          return acc;
        }, {} as Record<string, { casier: number, palette: number }>);

        // Convertir l'objet en tableau
        return Object.entries(regroupementParType).map(([type, data]) => ({
          format: Number(key),
          type,
          casier: data.casier,
          palette: data.palette
        }));
      });
      console.log('result', result);

      const params = {
        "regroupementId": item.regroupementId,
        "transporteurId": item.transporteur ? item.transporteur.id : item.commercial.id,
        "role": item.transporteur ? item.transporteur.role : item.commercial.role
      }
      this._activite.GetRetourWithArtilesListAgentPdf(params, result).then(
        (res: any) => {
          console.log('DownloadGlobalFacturesById:::>', res);
          this._spinner.hide();
        },
        (error: any) => {
          this._spinner.hide();
          this.toastr.info(error.error.message);
        }
      );
    }
  }

  ExportExcel(item: any) {
    this._spinner.show();
    const params = {
      "regroupementId": item.regroupementId,
      "transporteurId": item.transporteur ? item.transporteur.id : item.commercial.id,
      "role": item.transporteur ? item.transporteur.role : item.commercial.role
    }
    this._activite.GetRetourWithArtilesListAgentExcel(params).then(
      () => {
        this._spinner.hide();
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.info(error.error.message);
      }
    );
  }

  getFirstAndLastDate<T extends { createdAt: string }>(items: T[]): { firstDate: Date, lastDate: Date } | null {
    if (!items || items.length === 0) {
      return null;
    }

    const firstDate = new Date(items[items.length - 1].createdAt);
    const lastDate = new Date(items[0].createdAt);

    return { firstDate, lastDate };
  }

  GetRetourList(page: number = 1): Promise<void> {
    this.currentPage = page;
    const data = {
      paginate: true,
      page,
      limit: 8,
      numero: this.filters.numero || '',
      agent: this.filters.agent || '',
      contact: this.filters.contact || '',
      fonction: this.filters.fonction || '',
      statut: this.filters.statut || '',
      dateDebut: this.filters.dateDebut || '',
      dateFin: this.filters.dateFin || '',
      dateInventaire: this.filters.dateInventaire || '',
      depotId: this.filters.depotId || '',
    };
    this._spinner.show();
    return this._activite.GetRetourWithArtilesListAgent(data).then((res: any) => {
      this.dataList = res.data;
      this.totalPages = res.total;
      this._spinner.hide();
    });
  }


  // ===== Ajout manuel d'un article (emballage/plastique) absent des quantités théoriques =====
  // Le magasinier peut trouver physiquement un emballage/plastique qui ne figurait dans AUCUN
  // bordereau de retour de ce regroupement (donc absent de allArticles, quantité théorique
  // inexistante). On l'ajoute comme une colonne à part, avec expectedQuantity = receivedQuantity
  // au moment de l'enregistrement (voir TerminerInventaire) : il n'y a rien à comparer pour un
  // article qui n'était pas attendu, donc pas d'écart à générer, et le stock est bien crédité de
  // la quantité trouvée (le backend crédite le stock sur expectedQuantity, cf.
  // retour-article-inventaire.service.ts).
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
      this.articleService.GetEmballageList({ paginate: false, page: 1, limit: 0 }),
      this.articleService.GetPlastiqueNuList({ paginate: false, page: 1, limit: 0 }),
    ]).then(([emballageRes, plastiqueRes]: any[]) => {
      const emballages = (emballageRes.data || []).map((e: any) => ({ code: e.code, libelle: e.libelle, type: 'Emballage' }));
      const plastiques = (plastiqueRes.data || []).map((p: any) => ({ code: p.code, libelle: p.libelle, type: 'Plastique' }));
      this.articlePickerList = [...emballages, ...plastiques];
      this.filterArticlePicker();
    }).finally(() => this._spinner.hide());
  }

  filterArticlePicker() {
    const term = (this.articlePickerSearch || '').toLowerCase().trim();
    const existingCodes = new Set((this.allArticles || []).map((a: any) => a.codeEmballage));
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
      codeEmballage: item.code,
      expectedQuantity: 0,
      receivedQuantity: Number(this.newArticleQuantite),
      interchangeDetails: [],
      hasInterchange: false,
      isManual: true,
    });
    this.isAddArticleOpen = false;
  }

  removeManualArticle(article: any) {
    this.allArticles = this.allArticles.filter((a: any) => a !== article);
  }

  private calculerTotalEcart(articles: any[]): number {
    return (articles || []).reduce((s: number, a: any) => {
      const ecart = Number(a.receivedQuantity || 0) - Number(a.expectedQuantity || 0);
      return s + Math.abs(ecart) * Number(a.prixUnitaire || 0);
    }, 0);
  }

  async TerminerInventaire(datas: any, items: any) {
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
    const iteration = items.map((article: any) => {
      const {libelle, isManual, ...rest} = article; // on extrait libelle et garde le reste
      return {
        ...rest,
        regroupementEmballageId: datas.regroupementId
      };
    });

    const data = {
      "inventories": iteration
    }

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
      'Voulez-vous valider cet inventaire?'
    ).then((res) => {
      if (res.isConfirmed == true) {
        console.log('validation:::>', data);
        this._spinner.show();
        this._activite.TerminerInventaire(data).then((res: any) => {
          console.log('validation inventaire:::>', res);
          this._spinner.hide();
          this.isModalOpen = false;
          this.GetRetourList(this.currentPage);
          this.toastr.success(res.message);
        })
      } else {
        this.isModalOpen = false;
      }
    });

  }

  async AnnulerInventaire(data: any) {
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
      if (res.isConfirmed == true) {
        this._spinner.show();
        this._activite.AnnulerInventaire(data.regroupementId).then((res: any) => {
          this._spinner.hide();
          this.isModalOpen = false;
          this.GetRetourList(this.currentPage);
          this.toastr.success(res.message);
        }, (error: any) => {
          this._spinner.hide();
          this.toastr.error(error?.error?.message || "Erreur lors de l'annulation de l'inventaire.");
        });
      }
    });
  }

  TerminerRegroupement(data: any) {
    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous valider ce retour?'
    ).then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this._activite.TerminerRegroupement(data.regroupementId).then((res: any) => {
          console.log('validation retour:::>', res);
          this._spinner.hide();
          // Rafraîchit la liste en arrière-plan (page courante) et rouvre directement le même
          // regroupement (déjà connu via `data`, pas besoin de le rechercher dans la page
          // courante — avec la pagination serveur il pourrait ne plus s'y trouver).
          this.GetRetourList(this.currentPage);
          this.OnEdit(data);

          this.toastr.success(res.message);
        })
      } else {
        this.isModalOpen = false;
      }
    });

  }

  ValidateEmballage(id: any) {

    ALERT_QUESTION(
      'warning',
      'Attention !',
      'Voulez-vous valider ce retour?'
    ).then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this._activite.ValidateRetourById(id).then((res: any) => {
          console.log('validation retour:::>', res);
          this._spinner.hide();
          this.GetRetourList(this.currentPage);

          this.OnCloseModal();

          this.toastr.success(res.message);
        });
      } else {
        this.isModalOpen = false;
      }
    });
  }

  onPage(event: any) {
    this.rowsPerPage = event.rows;
    this.GetRetourList(event.first / event.rows + 1);
  }


  extractAllArticles(data: any[]) {
    const articleMap = new Map<string, any>();

    data.forEach((retour: any) => {

      // Codes sources des interchanges de ce retour (pour ne pas les exclure même si prixUnitaire === 0)
      const interchangeSourceCodes = new Set<string>(
        (retour.interchanges ?? [])
          .map((inter: any) => inter.codeEmballageSource)
          .filter(Boolean)
      );

      // ---------------- ARTICLES ----------------
      retour.articles?.forEach((article: any) => {

        if (article.prixUnitaire === 0 && !interchangeSourceCodes.has(article.productCode)) return;

        const code = article.productCode;
        console.log(article.interchangeDetails);

        if (!articleMap.has(code)) {
          articleMap.set(code, {
            libelle: article.produit.libelle,
            codeEmballage: code,
            expectedQuantity: 0,
            interchangeDetails: [],
            hasInterchange: false,
            prixUnitaire: 0,
          });
        }

        articleMap.get(code).expectedQuantity += article.quantity;
        if (article.prixUnitaire) articleMap.get(code).prixUnitaire = Number(article.prixUnitaire);
      });

      // ---------------- INTERCHANGES ----------------
      retour.interchanges?.forEach((inter: any) => {

        const sourceCode = inter.codeEmballageSource;
        const sourceLibelle = inter.emballageSource?.libelle;

        // 🔴 SOURCE
        if (!articleMap.has(sourceCode)) {
          articleMap.set(sourceCode, {
            libelle: sourceLibelle,
            codeEmballage: sourceCode,
            expectedQuantity: 0,
            interchangeDetails: [],
            hasInterchange: true
          });
        }

        inter.cibles?.forEach((cible: any) => {

          const cibleCode = cible.codeEmballageCible;
          const cibleLibelle = cible.emballageCible?.libelle;

          // 🟢 CIBLE
          if (!articleMap.has(cibleCode)) {
            articleMap.set(cibleCode, {
              libelle: cibleLibelle,
              codeEmballage: cibleCode,
              expectedQuantity: 0,
              interchangeDetails: [],
              hasInterchange: true
            });
          }

          // Ajouter détail côté source
          articleMap.get(sourceCode).interchangeDetails.push({
            type: 'OUT',
            contre: cibleLibelle,
            quantite: cible.quantite
          });

          // Ajouter détail côté cible
          articleMap.get(cibleCode).interchangeDetails.push({
            type: 'IN',
            contre: sourceLibelle,
            quantite: cible.quantite
          });

          articleMap.get(sourceCode).hasInterchange = true;
          articleMap.get(cibleCode).hasInterchange = true;
        });

      });

    });

    this.allArticles = Array.from(articleMap.values());
  }

  interchangeTooltip(retour: any, article: any): string {

    if (!retour?.interchanges) return '';

    const details: any[] = [];

    retour.interchanges.forEach((inter: any) => {

      const sourceCode = inter.codeEmballageSource;
      const sourceLibelle = inter.emballageSource?.libelle;

      inter.cibles?.forEach((cible: any) => {

        const cibleCode = cible.codeEmballageCible;
        const cibleLibelle = cible.emballageCible?.libelle;

        // 🔴 ARTICLE = SOURCE
        if (article.codeEmballage === sourceCode) {
          details.push({
            type: 'OUT',
            contre: cibleLibelle,
            quantite: cible.quantite
          });
        }

        // 🟢 ARTICLE = CIBLE
        if (article.codeEmballage === cibleCode) {
          details.push({
            type: 'IN',
            contre: sourceLibelle,
            quantite: cible.quantite
          });
        }

      });

    });

    // 🔥 Génération directe du texte (ancienne logique interchangeTooltip)

    if (details.length === 0) return '';

    return details
      .map(detail => {

        const type = detail?.type === 'IN'
          ? 'Reçu en '
          : detail?.type === 'OUT'
            ? 'Donné en '
            : '';

        const contre = detail?.contre || 'Inconnu';
        const quantite = detail?.quantite ?? 0;

        return `${type}${contre} (${quantite})`;

      })
      .join(' | ');
  }

  getQuantity(retour: any, libelle: string): number {
    let total = 0;
    retour.articles.forEach((article: any) => {
      if (article.produit.libelle === libelle) {
        total += article.quantity;
      }
    });
    return total;
  }

  getRemainingQuantity(retour: any, article: any): number {
    let base = 0;
    retour.articles?.forEach((a: any) => {
      if (a.productCode === article.codeEmballage) {
        base += a.quantity;
      }
    });
    if (!retour?.interchanges) return base;
    let outTotal = 0;
    retour.interchanges.forEach((inter: any) => {
      if (inter.codeEmballageSource === article.codeEmballage) {
        inter.cibles?.forEach((cible: any) => {
          outTotal += cible.quantite ?? 0;
        });
      }
    });
    return Math.max(0, base - outTotal);
  }

  preloadInventaire(inventaires: any) {

    for (const inv of inventaires) {
      const article = this.allArticles.find((a: any) => a.codeEmballage === inv.codeEmballage);
      console.log('preloadInventaire:', article);
      if (article) {
        article.receivedQuantity = inv.receivedQuantity;
      }
    }
  }

  getTotalForArticle(article: any): number {
    let total = 0;
    for (const retour of this.updateData.retours) {
      total += this.getQuantity(retour, article) || 0;
    }

    return total;
  }

  get inventaireComplet(): boolean {
    return this.allArticles?.length > 0 &&
      this.allArticles.every((a: any) => a.receivedQuantity !== null && a.receivedQuantity !== undefined);
  }

  protected readonly Status = Status;
  protected readonly console = console;
  protected readonly confirm = confirm;
}
