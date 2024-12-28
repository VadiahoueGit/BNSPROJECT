import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';

@Component({
  selector: 'app-transfert-de-stock',
  templateUrl: './transfert-de-stock.component.html',
  styleUrls: ['./transfert-de-stock.component.scss'],
})
export class TransfertDeStockComponent implements OnInit {
  transfertForm!: FormGroup;
  articleList: any;
  depotList: any;
  isModalOpen: boolean;
  selectedArticles: any[] = [];
  totalProduits: number = 0;
  tempArticleData: {
    [key: string]: { description: string; quantite: number };
  } = {};
  constructor(
    private _coreService: CoreServiceService,
    private fb: FormBuilder,
    private location: Location,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.transfertForm = this.fb.group({
      numero: [{ value: this.generateNumero(), disabled: true }],
      transferDate: [null, Validators.required],
      sourceDepotId: [null, Validators.required],
      destinationDepotId: [null, Validators.required],
      articles: this.fb.array([]),
    });
    this.GetArticleList(1);
    this.GetDepotList(1);
    // Ajouter un article par défaut
    this.addArticle();
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

  OnCloseModal() {
    this.deselectAllItems();
    this.isModalOpen = false;
  }

  OnCreate() {
    this.isModalOpen = true;

    // Initialiser l'objet temporaire avec des valeurs par défaut
    this.articleList.forEach((article: any) => {
      this.tempArticleData[article.reference] = {
        description: '',
        quantite: 0,
      };
    });
  }
  // get totalProduits(): number {
  //   return this.selectedArticles.reduce((total, article) => {
  //     return total + (article.quantite || 0);
  //   }, 0);
  // }
  // Accéder aux articles comme un FormArray
  get articles(): FormArray {
    return this.transfertForm.get('articles') as FormArray;
  }

  // Ajouter un article
  addArticle(): void {
    const articleForm = this.fb.group({
      codeArticle: [null, Validators.required],
      description: [''],
      quantite: [null, [Validators.required, Validators.min(1)]],
    });
    this.articles.push(articleForm);
  }

  removeArticle(article: any) {
    this.selectedArticles = this.selectedArticles.filter(
      (a) => a.reference !== article.reference
    );

    // Désélectionner dans la liste principale
    const index = this.articleList.findIndex(
      (a: any) => a.reference === article.reference
    );
    if (index > -1) {
      this.articleList[index].isChecked = false;
    }
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

  // Soumission du formulaire
  onSubmit(): void {
    if (this.transfertForm.valid) {
      alert('Transfert enregistré avec succès.');
    } else {
      alert('Veuillez remplir tous les champs requis.');
    }
  }

  add() {
    this.articleList.forEach((article: any) => {
      if (article.isChecked) {
        console.log(article.isChecked, 'article.isChecked');
        const description =
          this.tempArticleData[article.reference]?.description;
        const quantite = this.tempArticleData[article.reference]?.quantite;
        console.log(description, 'description.description');
        console.log(quantite, 'quantite.quantite');
        console.log(this.tempArticleData, 'tempArticleData');
        console.log(
          this.tempArticleData[article.reference],
          'article reference'
        );
        if (!description || quantite <= 0) {
          alert(
            `Veuillez remplir les champs pour l'article ${article.libelle}`
          );
          return;
        }
        this.selectedArticles.push({
          reference: article.reference,
          libelle: article.libelle,
          description: description,
          quantite: quantite,
          test: 'oui',
        });
      }
    });

    // Réinitialiser le modal après avoir ajouté les articles sélectionnés
    this.OnCloseModal();
    console.log(this.selectedArticles);
  }

  updateTotal() {
    this.totalProduits = this.selectedArticles.reduce((total, article) => {
      return total + (article.quantite || 0);
    }, 0);
  }
}
