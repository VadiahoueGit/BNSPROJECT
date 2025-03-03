import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {ALERT_QUESTION, storage_keys} from '../../shared-component/utils';
import {Location} from '@angular/common';
import {CoreServiceService} from "../../../core/core-service.service";
import {LocalStorageService} from "../../../core/local-storage.service";

@Component({
  selector: 'app-inventaire-stoks',
  templateUrl: './inventaire-stoks.component.html',
  styleUrls: ['./inventaire-stoks.component.scss']
})
export class InventaireStoksComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList: any[] = [];
  articleList: any[] = [];
  depotList: any[];
  searchTerm: string = '';
  filteredArticleList: any[] = [];
  selectedArticles: any[] = [];
  stocksDisponibles: any = {};
  ecart: any = {};
  stockPhysique: any = {};
  ecartPercent: any = {};
  InventaireForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  isArticleModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any = [];
  dataListGroupeArticles: any = [];
  dataListBouteilleVide: any = [];
  dataListPlastiqueNu: any = [];
  dataListLiquides: any = [];
  dataListArticlesProduits: any = [];
  currentPage: number;
  rowsPerPage: any;
  isAllSelected: boolean = false;
  now = new Date().toISOString().split('T')[0];
  UserInfo:any
  constructor(
    private localstorage:LocalStorageService,
    private articleService: ArticleServiceService,
    private _coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private location: Location,
  ) {
  }

  ngOnInit() {
    this.UserInfo = this.localstorage.getItem(storage_keys.STOREUser);
    this.InventaireForm = this.fb.group(
      {
        dateComptage: [null],
        utilisateur: ['', Validators.required],
        inventeur: ['', Validators.required],
        // description: [''],
        depotId: [null, Validators.required],
        articles: this.fb.array([], this.articlesRequiredValidator)

      });

    this.GetInventaireList(1);
    this.GetDepotList(1);
    // this.fetchData();
  }

  onDepotChange()
  {
    if(this.InventaireForm.controls['depotId'].valid)
    {
      this.GetArticleListByDepot();
    }

  }

  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  ArticleModal() {
    this.isArticleModalOpen = true;
    console.log(this.isModalOpen);
  }

  CloseArticleModal() {
    this.deselectAllItems()
    this.isArticleModalOpen = false;
    console.log(this.isModalOpen);
  }

  onSubmitSelection() {
    this.isArticleModalOpen = false;
  }
  toggleAllSelection(event: any): void {
    this.isAllSelected = event.target.checked; // Met à jour l'état global
    this.selectedArticles = []; // Réinitialise la liste des articles sélectionnés

    this.filteredArticleList.forEach(article => {
      article.isChecked = this.isAllSelected; // Applique l'état à tous les articles
      if (this.isAllSelected) {
        this.selectedArticles.push(article);
      }
      this.GetStockDisponibleByDepot(article)
    });

    this.afficherArticlesSelectionnes();
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    // this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  GetArticleListByDepot() {
    this._spinner.show();
    let depotId = this.InventaireForm.controls['depotId'].value
    this.articleService.GetArticleListByDepot(depotId).then((res: any) => {
      this.articleList = res.articles
      this.filteredArticleList = this.articleList;
      console.log('DATATYPEPRIX:::>', res);
      this._spinner.hide();
    });
  }

  GetInventaireList(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetInventaire(data).then((res: any) => {
      console.log('inventaire:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
  }

  goBack() {
    this.location.back()
  }

  // Méthode appelée lorsque l'état d'un checkbox change
  onCheckboxChange(article: any): void {
    console.log('onCheckboxChange', article);
    this.GetStockDisponibleByDepot(article)
    if (article.isChecked) {
      this.selectedArticles.push(article);
      this.afficherArticlesSelectionnes()
    } else {
      delete article.quantite;
      const indexToRemove = this.selectedArticles.findIndex(
        (selectedArticle) => selectedArticle.libelle === article.libelle
      );
      if (indexToRemove !== -1) {
        this.selectedArticles.splice(indexToRemove, 1);
      }
    }
    this.isAllSelected = this.filteredArticleList.every(a => a.isChecked);
    this.afficherArticlesSelectionnes()

  }

  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }

  removeArticle(item: any): void {
    item.isChecked = false;
    this.onCheckboxChange(item);
    const index = this.selectedArticles.findIndex((i: any) => i.id === item.id);
    if (index !== -1) {
      this.selectedArticles.splice(index, 1);
    }
    delete item.quantite;
    this.afficherArticlesSelectionnes();
  }


  // Méthode pour filtrer les articles en fonction du terme de recherche
  filterArticles(): void {
    console.log(this.searchTerm)
    if (this.searchTerm) {
      this.filteredArticleList = this.articleList.filter((article: any) =>
        article.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        article.code.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      console.log(this.filteredArticleList)
    } else {
      this.filteredArticleList = [...this.articleList];
    }
  }

  OnCloseModal() {
    this.deselectAllItems()
    this.isModalOpen = false;
    console.log(this.isModalOpen)
  }

  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            // this.GetArticleList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }

  onSubmit(): void {
    this.InventaireForm.controls['utilisateur'].setValue(this.UserInfo.nom+' '+this.UserInfo.prenom);
    this.selectedArticles = this.selectedArticles.filter(article => {
      if (article.isChecked) {
        if (!article.quantite || article.quantite <= 0) {
          this.onCheckboxChange(article);
          article.isChecked = false;
          return;
        } else {
          this.afficherArticlesSelectionnes();
          return article.quantite && article.quantite > 0;
        }
      }

    });
    console.log(this.selectedArticles)
    this.setArticles(this.selectedArticles)
    console.log("InventaireForm",this.InventaireForm)
    // this.stockForm.controls['depotId'].value
    if (this.InventaireForm.valid) {
      this._spinner.show()

      console.log(this.InventaireForm)
      this.articleService.SaveInventaire(this.InventaireForm.value).then((response: any) => {
        if (response.statusCode === 201) {
          this.InventaireForm.reset();
          this.deselectAllItems()
          // this.InventaireForm.controls['dateEnregistrement'].setValue(this.now)
          this.toastr.success(response.message);
          this.GetInventaireList(1);
        } else {
          this.toastr.error(response.message);
        }
        this._spinner.hide()
        this.OnCloseModal();

      }, (error: any) => {
        this._spinner.hide()
        this.toastr.error('Erreur!', "Erreur lors de l'enregistrement.");
        console.error('Erreur lors de la mise à jour', error);
      })
      console.log('Formulaire soumis :', this.InventaireForm.getRawValue());
    } else {
      this.toastr.error('Remplissez correctement!');
    }
  }

  articlesRequiredValidator(control: any): { [key: string]: boolean } | null {

    if (control.length === 0) {
      return {'articlesRequired': true};  // Le FormArray doit contenir au moins un article
    }
    // Vérifier la validité de chaque article (FormGroup)
    const allValid = control.controls.every((group: any) => group.valid);
    return allValid ? null : {'articlesInvalid': true};
  }

  async GetStockDisponibleByDepot(item: any): Promise<any> {
    let data = {
      productId: item.code,
      depotId: this.InventaireForm.controls['depotId'].value,
    };

    try {
      // Attendre la réponse de la promesse
      const response: any = await this.articleService.GetStockDisponibleByDepot(data);
      console.log(response)
      // Vérifier si le statusCode est 200
      if (response) {
        this.stocksDisponibles[item.id] = response.quantiteDisponible;
        console.log(this.stocksDisponibles)
      } else if (response.statusCode === 404) {
        this.stocksDisponibles[item.id] = 0; // Si le code est 404, retourner 0
      } else {
        return null; // Si un autre code, retourner null ou une valeur par défaut
      }
    } catch (error: any) {
      console.log(error);
      if (error.status === 404) {
        this.stocksDisponibles[item.id] = 0; // Si le code est 404, retourner 0
      }
    }
  }

  calculateData(stockTheorique: number, stockPhysique: number) {
    const ecart = stockPhysique - stockTheorique;
    console.log(ecart, stockTheorique)
    const ecartPercent = stockTheorique > 0 ? (ecart / stockTheorique) * 100 : 100;
    console.log(ecart, ecartPercent)
    return {ecart, ecartPercent}; // Facultatif : retournez un objet si besoin
  }


  // Méthode pour ajouter un article au FormArray
  setArticles(articlesData: any) {
    // Vider d'abord le FormArray
    this.articles.clear();
    console.log('articlesData:::>',articlesData);
    // Ajouter chaque article au FormArray
    articlesData.forEach((item: any) => {
      const articleGroup = this.fb.group({
        productCode: [item.articleCode, Validators.required],
        stockTheorique: [item.stockTheorique, Validators.required],
        stockPhysique: [item.quantite, [Validators.required, Validators.min(1)]],
        ecart: [item.ecart, Validators.required],
        pourcentageEcart: [item.ecartPercent, Validators.required],
        description: item.libelle
      })
      this.articles.push(articleGroup);
    })

    console.log('form', this.InventaireForm.getRawValue());
  }

  get articles(): FormArray {
    return this.InventaireForm.get('articles') as FormArray;
  }

  validateQuantite(data: any, stockTheorique: number): void {
    data.stockTheorique = stockTheorique;
    this.ecart[data.id] = this.calculateData(stockTheorique, data.quantite).ecart;
    data.ecart = this.ecart[data.id]
    this.ecartPercent[data.id] = this.calculateData(stockTheorique, data.quantite).ecartPercent;
    data.ecartPercent = this.ecartPercent[data.id]
    console.log('data',data)
  }


  deselectAllItems(): void {
    this.selectedArticles.forEach((item: any) => {
      delete item.quantite;
      this.onCheckboxChange(item);
      item.isChecked = false;

    });

    this.selectedArticles = [];

  }

  GetDepotList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetDepotList(data).then((res: any) => {
      console.log('GetDepotList:::>', res);
      this.depotList = res.data;
      this._spinner.hide();
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
      const [plastiques, liquides]: [any, any] = await Promise.all([
        this.articleService.GetPlastiqueNuList(data),  // Remplacez par votre méthode API
        this.articleService.GetLiquideList(data)      // Remplacez par votre méthode API
      ]);

      console.log("Données plastiques:", plastiques);
      console.log("Données liquides:", liquides);
      // Vérifier si plastiques et liquides sont bien des tableaux
      if (Array.isArray(plastiques.data)) {
        this.dataListPlastiqueNu = plastiques.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.articleList.push(...plastiques.data);
      } else {
        console.error("Les données de plastiques ne sont pas un tableau");
      }

      if (Array.isArray(liquides.data)) {
        this.dataListLiquides = liquides.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.articleList.push(...liquides.data);
      } else {
        console.error("Les données de liquides ne sont pas un tableau");
      }

      this.filteredArticleList = this.articleList;
      console.log('Données combinées dans dataList:', this.articleList);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération des données:', error);
    }
  }
}
