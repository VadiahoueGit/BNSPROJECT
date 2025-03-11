import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ActiviteService } from 'src/app/core/activite.service';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';
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
    33: { casiers: 63, type: 'biere' },
    25: { casiers: 63, type: 'biere' },
    50: { casiers: 66, type: 'plastique' },
    60: { casiers: 66, type: 'métal' },
  };
  currentPage: number;
  rowsPerPage: any;

  constructor(
    private _activite: ActiviteService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

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
    const articlesParFormat = commande.articles.reduce(
      (acc: any, article: any) => {
        const format = Number(article?.liquide?.format); // S'assurer que le format est un nombre

        if (!format) {
          console.warn(
            'Article sans format ou format non numérique détecté, ignoré:',
            article
          );
          return acc;
        }

        if (!acc[format]) {
          acc[format] = [];
        }

        acc[format].push(article);
        return acc;
      },
      {}
    );

    console.log('Articles regroupés par format:', articlesParFormat);

    // Calcul des palettes et des casiers pour chaque format
    this.result = Object.keys(articlesParFormat).reduce(
      (result: any, formatStr: string) => {
        const format = Number(formatStr); // Convertir la clé (string) en nombre
        const totalCasiers = articlesParFormat[format].reduce(
          (total: number, article: any) =>
            total + Number(article.quantite || 0),
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
    let articlesRegroupes: any = [];
    let montantTotal = 0;

    // Parcours de toutes les commandes
    commandes.forEach((commande) => {
      // Ajouter les articles de chaque commande à la liste des articles regroupés
      commande.articles.forEach((article: any) => {
        articlesRegroupes.push(article);
        montantTotal += parseFloat(article.montantEmballage);
      });
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
    // let regroup = this.regrouperArticles(item.commandes)
    // this.calculate(regroup);
    this._spinner.show();
    // if (this.regroupementFinal) {
    //   const result = Object.entries(this.regroupementFinal).map(([key, value]) => ({
    //     format: parseInt(key),
    //     casier: value.casier,
    //     palette: value.palettes
    //   }));
    const results = [
      {
        format: 15,
        casier: 2,
        palette: 20,
      },
      {
        format: 25,
        casier: 1,
        palette: 30,
      },
    ];
    this._activite.GetRegroupementEmballagePdf(idretour, results).then(
      (res: any) => {
        console.log('DownloadGlobalFacturesById:::>', res);

        this._spinner.hide();
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.info(error.error.message);
      }
    );
    // }
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
  ValidateEmballage(id: number) {}

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetRetourList(this.currentPage);
  }
}
