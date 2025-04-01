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
  regroupementList: any[] = [];
  regroupementTable: any[] = [];
  regroupementFinal: { [key: string]: Array<{ type: string; palettes: number; casier: number; totalQuantite:number }> } = {};
  result: { palettes: number; casier: number } | null = null;
  casiersPerPalette: Record<number, { casiers: number; type: string }[]> = {
    30: [{casiers: 60, type: 'SUCRERIE'}],
    33: [
      {casiers: 63, type: 'BIERE'},
      {casiers: 126, type: 'EAU'}
    ],
    25: [{casiers: 63, type: 'BIERE'}],
    50: [{casiers: 66, type: 'BIERE'}],
    60: [
      {casiers: 60, type: 'SUCRERIE'},
      {casiers: 66, type: 'BIERE'}
    ],
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
    console.log('Commande:', commande);

    // ✅ Ne réinitialise pas `regroupementFinal` complètement pour ne pas écraser les données existantes
    if (!this.regroupementFinal) {
      this.regroupementFinal = {};
    }
    console.log('fois:');
    this.result = { palettes: 0, casier: 0 };

    const articlesParFormatEtType = commande.articles.reduce((acc: any, article: any) => {
      const format = Number(article?.produit?.format);
      const type:string = article?.produit.groupearticle?.libelle;
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
          (total: number, article: any) => total + Number(article.quantite || 0),
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
              this.regroupementFinal[format].push({ type, palettes, casier, totalQuantite: 0 });
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
    let regroup = this.regrouperArticles(item.articles)
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
            acc[type] = { casier: 0, palette: 0 };
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
