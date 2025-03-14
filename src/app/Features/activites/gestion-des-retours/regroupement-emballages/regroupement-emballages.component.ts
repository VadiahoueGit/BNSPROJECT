import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ActiviteService} from 'src/app/core/activite.service';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {ALERT_QUESTION} from 'src/app/Features/shared-component/utils';

interface RegroupementItem {
  palettes: number;
  casier: number;
  type: string;
}

@Component({
  selector: 'app-regroupement-emballages',
  templateUrl: './regroupement-emballages.component.html',
  styleUrls: ['./regroupement-emballages.component.scss'],
})
export class RegroupementEmballagesComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];

  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  cargaison: number = 0;
  isEditMode: boolean = false;
  result: { palettes: number; casier: number } | null = null;
  regroupementList: any[] = [];
  regroupementTable: any[] = [];
  regroupementFinal: Record<string, RegroupementItem>;
  casiersPerPalette: Record<number, { casiers: number; type: string }> = {
    33: {casiers: 63, type: 'biere'},
    25: {casiers: 63, type: 'biere'},
    50: {casiers: 66, type: 'plastique'},
    60: {casiers: 66, type: 'métal'},
  };
  currentPage: number;
  rowsPerPage: any;

  constructor(
    private _activite: ActiviteService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.GetRetourList(1);
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
    this.isModalOpen = true;
  }

  calculate(commande: any): void {
    console.log('commande', commande);
    // Regrouper les articles par format
    const articlesParFormat = commande.articles.reduce((acc: any, article: any) => {
      console.log("article", article);

      if (!article.produit) {
        console.warn("Article sans produit détecté, ignoré:", article);
        return acc;
      }

      const format = Number(article.produit.format); // Convertir en nombre

      if (!format) {
        console.warn("Format invalide détecté, ignoré:", article.produit);
        return acc;
      }

      if (!acc[format]) {
        // Si le format n'existe pas encore, on initialise
        acc[format] = {
          format: format,
          totalQuantity: 0,
          articles: []
        };
      }

      // Ajouter la quantité et stocker l'article
      acc[format].totalQuantity += article.quantity;
      acc[format].articles.push(article);

      return acc;
    }, {});


    console.log('Articles regroupés par format:', articlesParFormat);

    // Calcul des palettes et des casiers pour chaque format
    if (!commande || !Array.isArray(commande.articles)) {
      console.error("commande.articles est invalide :", commande);
    } else {
      const articlesParFormat = commande.articles.reduce((acc: any, article: any) => {
        console.log("article", article);

        if (!article.produit) {
          console.warn("Article sans produit détecté, ignoré:", article);
          return acc;
        }

        const format = Number(article.produit.format);

        if (!format) {
          console.warn("Format invalide détecté, ignoré:", article.produit);
          return acc;
        }

        if (!acc[format]) {
          acc[format] = {format, totalQuantity: 0, articles: []};
        }
        console.log('test', article.quantity)
        acc[format].totalQuantity += article.quantity;
        acc[format].articles.push(article);

        return acc;
      }, {});

      console.log("articlesParFormat", articlesParFormat);
    }

    this.result = Object.keys(articlesParFormat).reduce(
      (result: any, formatStr: string) => {
        const format = Number(formatStr); // Convertir la clé en nombre
        const articles = articlesParFormat[format].articles; // Accéder aux articles (tableau)

        const totalCasiers = articles.reduce(
          (total: number, article: any) => total + Number(article.quantity || 0),
          0
        );

        const paletteInfo = this.casiersPerPalette[format];
        if (!paletteInfo) {
          console.warn(`Format invalide ou non trouvé : ${format}`);
          result[format] = null;
          return result;
        }

        const { casiers, type } = paletteInfo;

        const palettes = Math.floor(totalCasiers / casiers);
        const casier = totalCasiers % casiers;
        this.cargaison += totalCasiers;
        result[format] = { palettes, casier, type };
        return result;
      },
      {}
    );

    this.regroupementTable.push(this.result);
    console.log('Résultat final', this.result);
    console.log('regroupementList', this.regroupementTable);
    this.regrouperParFormat();
  }

  regrouperParFormat(): void {
    const regroupement = this.regroupementTable.reduce(
      (acc: any, item: any) => {
        Object.entries(item).forEach(([format, details]: [string, any]) => {
          if (!acc[format]) {
            acc[format] = {
              palettes: 0,
              casier: 0,
              type: details.type,
            };
          }

          // Ajouter les palettes et casiers au format correspondant
          acc[format].palettes += details.palettes;
          acc[format].casier += details.casier;

          // Gérer les casiers excédentaires pour compléter une palette
          const casiersParPalette =
            this.casiersPerPalette[Number(format)]?.casiers || 0;
          if (casiersParPalette && acc[format].casier >= casiersParPalette) {
            const palettesSupplementaires = Math.floor(
              acc[format].casier / casiersParPalette
            );
            acc[format].palettes += palettesSupplementaires;
            acc[format].casier %= casiersParPalette;
          }
        });

        return acc;
      },
      {}
    );

    console.log('Regroupement par format:', regroupement);
    this.regroupementFinal = regroupement;

    console.log('test', this.regroupementTable);
    console.log('regroupementFinal:', this.regroupementFinal);
  }

  regrouperArticles(commandes: any[]): any {
    console.log('Regroupement par format:', commandes);
    let articlesRegroupes: any = [];
    let montantTotal = 0;

    // Parcours de toutes les commandes
    commandes.forEach((commande: any) => {
      // Ajouter l'article de chaque commande à la liste des articles regroupés
      if (commande) { // Vérifiez que produit existe
        articlesRegroupes.push(commande); // Poussez l'objet produit, pas un tableau
      }
    });


    return {
      articles: articlesRegroupes,
      montantTotal: montantTotal,
    };
  }

  PrintDoc(item: any) {
    console.log(item);
    this.regroupementTable = [];
    const idretour = item.id;
    let regroup = this.regrouperArticles(item.articles)
    this.calculate(regroup);
    this._spinner.show();
    if (this.regroupementFinal) {
      const result = Object.entries(this.regroupementFinal).map(([key, value]) => ({
        format: parseInt(key),
        casier: value.casier,
        palette: value.palettes
      }));
      console.log('result', result);

      this._activite.GetRegroupementEmballagePdf(idretour, result).then(
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

  GetRetourList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._activite.GetRetourWithArtilesList(data).then((res: any) => {
      console.log('retour list:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
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
}
