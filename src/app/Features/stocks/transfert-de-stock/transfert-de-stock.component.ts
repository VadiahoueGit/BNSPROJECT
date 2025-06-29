import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';

@Component({
  selector: 'app-transfert-de-stock',
  templateUrl: './transfert-de-stock.component.html',
  styleUrls: ['./transfert-de-stock.component.scss'],
})
export class TransfertDeStockComponent implements OnInit {
  transfertForm!: FormGroup;
  articleList: any[] = [];
  dataList: any[] = [];
  dataListLiquides: any[] = [];
  dataListPlastiqueNu: any[] = [];
  filteredArticleList: any[] = [];
  depotList: any[] = [];
  isModalOpen: boolean;
  selectedArticles: any[] = [];
  totalProduits: number = 0;
  tempArticleData: {
    [key: string]: { description: string; quantite: number };
  } = {};
  numero: string = '';
  comment: string = '';
  transferDate: string = '';
  sourceDepotId = null;
  destinationDepotId = null;
  searchTerm: string = '';

  constructor(
    private _coreService: CoreServiceService,
    private fb: FormBuilder,
    private location: Location,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.numero = this.generateNumero();
    const today = new Date();
    this.transferDate = today.toISOString().split('T')[0];
    this.GetDepotList(1);
    this.fetchData()
  }
  initializeTempArticleData() {
    this.tempArticleData = {};
    this.articleList.forEach((article: any) => {
      this.tempArticleData[article.articleId] = {
        description: '',
        quantite: 0,
      };
    });
  }
  goBack() {
    this.location.back();
  }
  // Génère un numéro de transfert unique
  generateNumero(): string {
    return `T-${new Date().getTime()}`;
  }
  deselectAllItems(): void {
    this.selectedArticles.forEach((item: any) => {
      delete item.quantite;
      delete item.description;
      item.isChecked = false;
    });
  }

  removeArticle(article: any) {
    const index = this.selectedArticles.findIndex(
      (item) => item.articleId === article.articleId
    );
    if (index !== -1) {
      this.selectedArticles.splice(index, 1);
    }
    this.updateTotal();
  }


  GetDepotList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetDepotList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.depotList = res.data;
      this._spinner.hide();
    });
  }
  OnCreate() {
    this.isModalOpen = true;
    this.articleList.forEach((article) => {
      const matchedArticle = this.selectedArticles.find(
        (selected) => selected.articleId === article.articleId
      );

      if (matchedArticle) {
        this.tempArticleData[article.articleId] = {
          description: matchedArticle.description,
          quantite: matchedArticle.quantite,
        };
        article.isChecked = true;
      } else {

        this.initializeTempArticleData();
        article.isChecked = false;
      }
    });
  }

  // Fermer la modal
  OnCloseModal() {
    this.isModalOpen = false;
  }

  isAnyArticleSelected(): boolean {
    return this.articleList.some(
      (article) => this.tempArticleData[article.articleId]?.quantite > 0  &&
      this.tempArticleData[article.articleId]?.quantite <= article.quantiteDisponible
    );
  }
  isArticleSelected(articleId: number): boolean {
    return !!this.selectedArticles.find((a) => a.articleId === articleId);
  }

  // Méthode pour filtrer les articles en fonction du terme de recherche
  filterArticles(): void {
    console.log(this.searchTerm)
    if (this.searchTerm) {
      this.dataList.forEach((element: any) => {
        if (element.code)
        {
          console.log(element.code);
        }
      })
      this.filteredArticleList = this.dataList.filter((article: any) =>
        (article.libelle?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) || '') ||
        (article.code?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) || '') ||
        (article.reference?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) || '')
      );

      console.log(this.filteredArticleList)
    } else {
      this.filteredArticleList = [...this.dataList];
    }
  }
  add(): void {
    this.articleList.forEach((article) => {
      if (
        article.isChecked &&
        this.tempArticleData[article.articleId].quantite > 0
      ) {
        const existingArticle = this.selectedArticles.find(
          (a) => a.articleId === article.articleId
        );

        if (existingArticle) {
          existingArticle.description =
            this.tempArticleData[article.articleId].description;
          existingArticle.quantite =
            this.tempArticleData[article.articleId].quantite;
        } else {
          this.selectedArticles.push({
            articleId: article.articleId,
            articleCode: article.articleCode,
            articleName: article.articleName,
            description: this.tempArticleData[article.articleId].description,
            quantite: this.tempArticleData[article.articleId].quantite,
          });
        }
      }
    });
    this.updateTotal();
    this.isModalOpen = false;
  }



  updateTotal() {
    this.totalProduits = this.selectedArticles.reduce((total, article) => {
      return total + (article.quantite || 0);
    }, 0);
  }

  onSubmit() {
    const transferData = {
      numero: this.numero,
      sourceDepotId: this.sourceDepotId,
      destinationDepotId: this.destinationDepotId,
      articles: this.selectedArticles.map((article) => ({
        productCode: article.articleCode,
        quantite: article.quantite,
      })),
      transferDate: this.transferDate,
      comment: this.comment || '',
    };

    console.log('Données prêtes pour enregistrement :', transferData);

    this.submitToServer(transferData);
  }

  submitToServer(data: any) {
    if (data !== undefined) {
      this._spinner.show();
      this.articleService.TransfertStock(data).then(
        (response: any) => {
          if (response.statusCode === 201) {
            this.selectedArticles = [];
            this.totalProduits = 0;
            this.sourceDepotId = null;
            this.destinationDepotId = null;
            this.toastr.success(response.message);
          } else {
            this.toastr.error(response.message);
          }
          this._spinner.hide();
        },

        (error: any) => {
          this._spinner.hide();
          this.toastr.error('Erreur!', "Erreur lors de l'enregistrement.");
          console.error('Erreur lors de la mise à jour', error);
        }
      );
    } else {
      this.toastr.error('donnée incorrecte!');
    }
  }
  selectDepot() {
    let id = this.sourceDepotId;
    this.articleService.GetStockByDepot(id).then((res: any) => {
      console.log(res, 'produit par depot');
      this.articleList = res.articles;
      this.filteredArticleList = this.articleList;
    });
  }

  async fetchData() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    try {
      // Effectuer les deux appels API en parallèle
      const [plastiques, articles, emballage]: [any, any, any] = await Promise.all([
        this.articleService.GetPlastiqueNuList(data),  // Remplacez par votre méthode API
        this.articleService.GetArticleList(data),
        this.articleService.GetEmballageList(data) // Remplacez par votre méthode API
      ]);

      console.log("Données plastiques:", plastiques);
      console.log("Données liquides:", articles);
      console.log("emballage:", emballage);
      // Vérifier si plastiques et liquides sont bien des tableaux
      if (Array.isArray(plastiques.data)) {
        this.dataListPlastiqueNu = plastiques.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataList.push(...plastiques.data);
      } else {
        console.error("Les données de plastiques ne sont pas un tableau");
      }

      if (Array.isArray(articles.data)) {
        // this.dataListLiquides = articles.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataList.push(...articles.data);
      } else {
        console.error("Les données de liquides ne sont pas un tableau");
      }
      if (Array.isArray(emballage.data)) {
        // this.dataListLiquides = emballage.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataList.push(...emballage.data);
      } else {
        console.error("Les données de liquides ne sont pas un tableau");
      }
      this.filteredArticleList = this.dataList;
      console.log('Données combinées dans dataList:', this.dataList);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération des données:', error);
    }
  }
}
