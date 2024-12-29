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
  depotList: any[] = [];
  isModalOpen: boolean;
  selectedArticles: any[] = [];
  totalProduits: number = 0;
  tempArticleData: {
    [key: string]: { description: string; quantite: number };
  } = {};
  numero: string = ''; // Numéro du transfert (généré automatiquement)
  comment: string = '';
  transferDate: string = ''; // Date d'enregistrement
  sourceDepotId = null; // Dépôt d'origine sélectionné
  destinationDepotId = null; // Dépôt récepteur sélectionné
  constructor(
    private _coreService: CoreServiceService,
    private fb: FormBuilder,
    private location: Location,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.numero = this.generateNumero();
    const today = new Date();
    this.transferDate = today.toISOString().split('T')[0];
    this.GetArticleList(1);
    this.GetDepotList(1);
    // Ajouter un article par défaut
    // if (this.articleList && this.articleList.length > 0) {
    //   this.initializeTempArticleData();
    // }
  }
  // Initialisation des données temporaires
  initializeTempArticleData() {
    this.tempArticleData = {}; // Remet à zéro les données temporaires
    this.articleList.forEach((article: any) => {
      this.tempArticleData[article.reference] = {
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
      (item) => item.reference === article.reference
    );
    if (index !== -1) {
      this.selectedArticles.splice(index, 1);
    }
    this.updateTotal()
  }
  GetArticleList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.articleList = res.data;
      this.initializeTempArticleData();
      this._spinner.hide();
    });
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
    this.initializeTempArticleData();
  }

  // Fermer la modal
  OnCloseModal() {
    this.isModalOpen = false;
  }
  // add() {
  //   this.articleList.forEach((article: any) => {
  //     if (article.isChecked) {
  //       console.log(article.isChecked, 'article.isChecked');
  //       const description =
  //         this.tempArticleData[article.reference]?.description;
  //       const quantite = this.tempArticleData[article.reference]?.quantite;
  //       console.log(description, 'description.description');
  //       console.log(quantite, 'quantite.quantite');
  //       console.log(this.tempArticleData, 'tempArticleData');
  //       console.log(
  //         this.tempArticleData[article.reference],
  //         'article reference'
  //       );
  //       if (!description || quantite <= 0) {
  //         alert(
  //           `Veuillez remplir les champs pour l'article ${article.libelle}`
  //         );
  //         return;
  //       }
  //       this.selectedArticles.push({
  //         reference: article.reference,
  //         libelle: article.libelle,
  //         description: description,
  //         quantite: quantite,
  //         test: 'oui',
  //       });
  //     }
  //   });

  //   // Réinitialiser le modal après avoir ajouté les articles sélectionnés
  //   this.OnCloseModal();
  //   console.log(this.selectedArticles);
  // }
  isAnyArticleSelected(): boolean {
    return this.articleList.some((article) => article.isChecked);
  }
  add() {
    this.articleList.forEach((article: any) => {
      if (article.isChecked) {
        const description =
          this.tempArticleData[article.reference]?.description;
        const quantite = this.tempArticleData[article.reference]?.quantite;
        this.selectedArticles.push({
          reference: article.reference,
          libelle: article.libelle,
          description: description,
          quantite: quantite,
        });

        article.isChecked = false;
      }
    });
    this.updateTotal();
    this.OnCloseModal();
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
        productCode: article.reference, 
        quantite: article.quantite,
      })),
      transferDate: this.transferDate, 
      comment: this.comment || '', 
    };

    console.log('Données prêtes pour enregistrement :', transferData);

    this.submitToServer(transferData);
  }

  submitToServer(data: any) {
    if (data!== undefined) {
    this._spinner.show()
    this.articleService.TransfertStock(data).then((response:any) => {
      if(response.statusCode === 201) {
        this.selectedArticles = []
        this.toastr.success(response.message);
      }else{
        this.toastr.error(response.message);
      }
      this._spinner.hide()

    },(error: any) => {
      this._spinner.hide()
      this.toastr.error('Erreur!', "Erreur lors de l'enregistrement.");
      console.error('Erreur lors de la mise à jour', error);
    })
  } else {
    this.toastr.error('donnée incorrecte!');
  }
  }
}
