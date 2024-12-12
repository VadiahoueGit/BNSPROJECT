import {Location} from '@angular/common';
import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {CoreServiceService} from 'src/app/core/core-service.service';


@Component({
  selector: 'app-entreen-stock',
  templateUrl: './entreen-stock.component.html',
  styleUrls: ['./entreen-stock.component.scss']
})
export class EntreenStockComponent {
  stockForm!: FormGroup;
  articleList: any
  depotList: any
  isModalOpen: boolean
  selectedArticles: any[] = [];
  searchTerm: string = '';
  filteredArticleList: any[] = [];
  dataListPlastiqueNu: any

  dataListLiquides: any
  dataList: any[] = [];

  constructor(private _coreService: CoreServiceService, private fb: FormBuilder, private location: Location, private articleService: ArticleServiceService,
              private _spinner: NgxSpinnerService) {
    //
  }

  ngOnInit(): void {

    this.stockForm = this.fb.group({
      numero: [{value: this.generateNumero(), disabled: true}], // Généré automatiquement
      dateEnregistrement: [new Date().toISOString().split('T')[0], Validators.required],
      dateDocument: ['', Validators.required],
      codeArticle: ['', Validators.required],
      description: ['', Validators.required],
      quantite: [0, [Validators.required, Validators.min(1)]],
      magasin: ['', Validators.required],
      stockDisponible: [{value: 0, disabled: true}], // Exemple de valeur initiale
      commentaire: ['', Validators.required],
    });

    this.GetDepotList(1)
    this.GetArticleList(1)
    this.fetchData()
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
      this.filteredArticleList = this.dataList;
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

  generateNumero(): string {
    return 'STK-' + Date.now();
  }

  goBack() {
    this.location.back()
  }

  onSubmitSelection() {
    this.isModalOpen = false;
  }

  resetSelections(): void {
    this.articleList.forEach((article: any) => article.isChecked = false);
    this.selectedArticles = [];
  }

  // Méthode appelée lorsque l'état d'un checkbox change
  onCheckboxChange(article: any, index: number): void {
    if (article.isChecked) {
      this.selectedArticles.push(article);
      this.afficherArticlesSelectionnes()
    } else {
      const indexToRemove = this.selectedArticles.findIndex(
        (selectedArticle) => selectedArticle.libelle === article.libelle
      );
      if (indexToRemove !== -1) {
        this.selectedArticles.splice(indexToRemove, 1);
        this.afficherArticlesSelectionnes()
      }
    }
  }

  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }

  removeArticle(index: number = 0): void {
    // this.articles.removeAt(index);
  }

  // Méthode pour filtrer les articles en fonction du terme de recherche
  filterArticles(): void {
    console.log(this.searchTerm)
    if (this.searchTerm) {
      this.filteredArticleList = this.dataList.filter((article: any) =>
        article.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        article.code.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      console.log(this.filteredArticleList)
    } else {
      this.filteredArticleList = [...this.dataList];
    }
  }

  OnCloseModal() {
    this.selectedArticles = []
    this.resetSelections()
    this.isModalOpen = false;
    console.log(this.isModalOpen)
  }

  OnCreate() {
    this.isModalOpen = true;
    console.log(this.isModalOpen)
  }

  onSubmit(): void {
    if (this.stockForm.valid) {
      console.log('Formulaire soumis :', this.stockForm.getRawValue());
    } else {
      console.error('Formulaire invalide');
    }
  }

  async fetchData() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    try {
      // Effectuer les deux appels API en parallèle
      const [plastiques, liquides] : [any, any] = await Promise.all([
        this.articleService.GetPlastiqueNuList(data),  // Remplacez par votre méthode API
        this.articleService.GetLiquideList(data)      // Remplacez par votre méthode API
      ]);

      console.log("Données plastiques:", plastiques);
      console.log("Données liquides:", liquides);
      // Vérifier si plastiques et liquides sont bien des tableaux
      if (Array.isArray(plastiques.data)) {
        this.dataListPlastiqueNu = plastiques.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataList.push(...plastiques.data);
      } else {
        console.error("Les données de plastiques ne sont pas un tableau");
      }

      if (Array.isArray(liquides.data)) {
        this.dataListLiquides = liquides.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataList.push(...liquides.data);
      } else {
        console.error("Les données de liquides ne sont pas un tableau");
      }


      console.log('Données combinées dans dataList:', this.dataList);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération des données:', error);
    }
  }
}
