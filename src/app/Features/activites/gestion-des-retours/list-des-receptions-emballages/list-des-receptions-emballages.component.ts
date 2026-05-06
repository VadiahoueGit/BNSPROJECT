import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {CoreServiceService} from 'src/app/core/core-service.service';
import {ALERT_QUESTION} from 'src/app/Features/shared-component/utils';
import {ActiviteService} from "../../../../core/activite.service";
import {data} from "jquery";
import {Status} from "../../../../utils/utils";

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
    [key: string]: Array<{ type: string; palettes: number; casier: number; totalQuantite: number }>
  } = {};
  result: { palettes: number; casier: number } | null = null;
  casiersPerPalette: Record<number, { casiers: number; type: string }[]> = {};
  currentPage: number;
  rowsPerPage: any;

  constructor(
    private _activite: ActiviteService,
    private _coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.GetRetourList(1);
    this.LoadCasiersPerPalette();
  }

  LoadCasiersPerPalette() {
    this._coreService.GetReglePaletteList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.casiersPerPalette = {};
      (res.data as any[]).forEach(regle => {
        if (!this.casiersPerPalette[regle.format]) {
          this.casiersPerPalette[regle.format] = [];
        }
        this.casiersPerPalette[regle.format].push({ casiers: regle.casiers, type: regle.type });
      });
    });
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

  OnEdit(data: any) {
    console.log(data);
    this.updateData = data;
    this.dates = this.getFirstAndLastDate(this.updateData.retours)
    this.extractAllArticles(this.updateData.retours)
    if (this.updateData.inventaires.length > 0) {
      this.preloadInventaire(this.updateData.inventaires);
    }

    this.isModalOpen = true;
  }

  get filteredArticles() {
    return this.updateData?.retours?.articles?.filter((a:any) => a.prixUnitaire > 0);
  }
  calculate(commande: any): void {
    console.log('Commande:', commande);

    // ✅ Ne réinitialise pas `regroupementFinal` complètement pour ne pas écraser les données existantes
    if (!this.regroupementFinal) {
      this.regroupementFinal = {};
    }
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

        const paletteInfos = this.casiersPerPalette[format];
        if (!paletteInfos || paletteInfos.length === 0) {
          console.warn(`Format invalide ou non trouvé : ${format}`);
          return;
        }

        paletteInfos.forEach(({casiers, type: paletteType}) => {
          if (paletteType === type) {
            const palettes = Math.floor(totalCasiers / casiers);
            const casier = totalCasiers % casiers;

            // ✅ Vérifie si ce format et type existent déjà dans regroupementFinal
            if (!this.regroupementFinal[format]) {
              this.regroupementFinal[format] = [];
            }

            const existingEntry = this.regroupementFinal[format].find((entry: any) => entry.type === type);
            if (existingEntry) {
              // 🔄 Additionne les nouvelles valeurs sans écraser l'existant
              existingEntry.palettes += palettes;
              existingEntry.casier += casier;
            } else {
              // ➕ Ajoute un nouvel article s'il n'existe pas encore
              this.regroupementFinal[format].push({type, palettes, casier, totalQuantite: 0});
            }
          }
        });
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

  getFirstAndLastDate<T extends { createdAt: string }>(items: T[]): { firstDate: Date, lastDate: Date } | null {
    if (!items || items.length === 0) {
      return null;
    }

    const firstDate = new Date(items[items.length - 1].createdAt);
    const lastDate = new Date(items[0].createdAt);

    return { firstDate, lastDate };
  }

  GetRetourList(page: number): Promise<void> {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    return this._activite.GetRetourWithArtilesListAgent(data).then((res: any) => {
      console.log('retour list:::>', res);
      this.dataList = res.data;
      this.totalPages = res.total;
      this._spinner.hide();
    });
  }


  TerminerInventaire(datas: any, items: any) {
    const iteration = items.map((article: any) => {
      const {libelle, ...rest} = article; // on extrait libelle et garde le reste
      return {
        ...rest,
        regroupementEmballageId: datas.regroupementId
      };
    });

    const data = {
      "inventories": iteration
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
          this.GetRetourList(1);
          const match = this.dataList.find((item:any) => item.id === datas.id);
          this.OnEdit(match);
          this.isModalOpen = false
          this.toastr.success(res.message);
        })
      } else {
        this.isModalOpen = false;
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
          this.GetRetourList(1).then(() => {
            // Ici, this.dataList est prêt
            const match = this.dataList.find((item: any) => item.regroupementId === data.regroupementId);
            console.log('match:', match);
            this.OnEdit(match);
          });


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
          this.GetRetourList(1);

          this.OnCloseModal();

          this.toastr.success(res.message);
        });
      } else {
        this.isModalOpen = false;
      }
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetRetourList(this.currentPage);
  }


  extractAllArticles(data: any[]) {
    const articleMap = new Map<string, any>();

    data.forEach((retour: any) => {

      // ---------------- ARTICLES ----------------
      retour.articles?.forEach((article: any) => {

        if (article.prixUnitaire === 0) return;

        const code = article.productCode;
        console.log(article.interchangeDetails);

        if (!articleMap.has(code)) {
          articleMap.set(code, {
            libelle: article.produit.libelle,
            codeEmballage: code,
            expectedQuantity: 0,
            interchangeDetails: [],
            hasInterchange: false
          });
        }

        articleMap.get(code).expectedQuantity += article.quantity;
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

  protected readonly Status = Status;
  protected readonly console = console;
  protected readonly confirm = confirm;
}
