import {Location} from '@angular/common';
import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {CoreServiceService} from 'src/app/core/core-service.service';
import {ToastrService} from "ngx-toastr";


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
  now = new Date().toISOString().split('T')[0];
  dataListLiquides: any
  dataList: any[] = [];
  stocksDisponibles: any = {};
  constructor(private _coreService: CoreServiceService, private fb: FormBuilder, private location: Location, private articleService: ArticleServiceService,
              private _spinner: NgxSpinnerService,private toastr: ToastrService,) {
    //
  }

  ngOnInit(): void {

    this.stockForm = this.fb.group({
      numero: [''], // Généré automatiquement
      type: ['ENTREE'],
      dateDocument: ['', Validators.required],
      dateEnregistrement: ['', Validators.required],
      depotId: [null, Validators.required],
      commentaire: [''],
      articles: this.fb.array([], this.articlesRequiredValidator)
    });
    this.stockForm.controls['dateEnregistrement'].setValue(this.now)
    this.stockForm.get('dateEnregistrement')?.disable();

    this.generateNumero()
    this.GetDepotList(1)
    // this.GetArticleList(1)
    this.fetchData()
  }


  get articles(): FormArray {
    return this.stockForm.get('articles') as FormArray;
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
      // this.filteredArticleList = this.dataList;
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

  generateNumero() {
    this.stockForm.controls['numero'].setValue('ENT-' + Date.now()) ;
  }

  goBack() {
    this.location.back()
  }

  onSubmitSelection() {
    this.isModalOpen = false;
  }


  // Méthode appelée lorsque l'état d'un checkbox change
  onCheckboxChange(article: any): void {
    console.log('onCheckboxChange',article);
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
        this.afficherArticlesSelectionnes()
      }
    }
  }

  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }

  removeArticle(item: any): void {
    item.isChecked = false;
    this.onCheckboxChange(item);
    const index = this.selectedArticles.findIndex((i: any) => i.id === item.id);

    if (index !== -1) {
      this.selectedArticles = this.selectedArticles.slice(0, index).concat(this.selectedArticles.slice(index + 1));
    }

  }

  // Méthode pour filtrer les articles en fonction du terme de recherche
  filterArticles(): void {
    console.log(this.searchTerm)
    if (this.searchTerm) {
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

  OnCloseModal() {
    this.deselectAllItems()
    this.isModalOpen = false;
    console.log(this.isModalOpen)
  }

  OnCreate() {
    this.isModalOpen = true;
    console.log(this.isModalOpen)
  }

  onSubmit(): void {
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
    console.log(this.stockForm)
    if(this.stockForm.controls['type'].value == null)
    {
      this.stockForm.controls['type'].setValue('ENTREE') ;
    }
    // this.stockForm.controls['depotId'].value
    if (this.stockForm.valid) {
      this._spinner.show()

      console.log(this.stockForm)
      this.articleService.SaveStock(this.stockForm.value).then((response:any) => {
        if(response.statusCode === 201) {
          this.stockForm.reset();
          this.deselectAllItems()
          this.generateNumero()
          this.stockForm.controls['dateEnregistrement'].setValue(this.now)
          this.toastr.success(response.message);
        }else{
          this.toastr.error(response.message);
        }
        this._spinner.hide()
        this.OnCloseModal();

      },(error: any) => {
        this._spinner.hide()
        this.toastr.error('Erreur!', "Erreur lors de l'enregistrement.");
        console.error('Erreur lors de la mise à jour', error);
      })
      console.log('Formulaire soumis :', this.stockForm.getRawValue());
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
      productCode: item.code || item.reference,
      depotId: this.stockForm.controls['depotId'].value,
    };

    try {
      // Attendre la réponse de la promesse
      const response:any = await this.articleService.GetStockDisponibleByDepot(data);
      console.log(response)
      // Vérifier si le statusCode est 200
      if (response) {
        this.stocksDisponibles[item.id] = response.quantiteDisponible;
        console.log(this.stocksDisponibles)
      } else if (response.statusCode === 404) {
        this.stocksDisponibles[item.id] =  0; // Si le code est 404, retourner 0
      } else {
        return null; // Si un autre code, retourner null ou une valeur par défaut
      }
    } catch (error:any) {
      console.log(error);
      if (error.status === 404) {
        this.stocksDisponibles[item.id] = 0; // Si le code est 404, retourner 0
      }
    }
  }

  // Méthode pour ajouter un article au FormArray
  setArticles(articlesData: any) {
    // Vider d'abord le FormArray
    this.articles.clear();
    console.log(articlesData);
    // Ajouter chaque article au FormArray
    articlesData.forEach((item: any) => {
      const articleGroup = this.fb.group({
        productCode: [item.code || item.reference, Validators.required],
        quantite: [item.quantite, [Validators.required, Validators.min(1)]]
      })
      this.articles.push(articleGroup);
    })

      console.log('this.articles.length > 0', this.articles)
  }

  validateQuantite(data: any): void {
    // Si la quantité dépasse la quantité disponible, réinitialiser la quantité à la valeur maximale
    if (data.quantite > this.stocksDisponibles[data.id]) {
      data.quantite = this.stocksDisponibles[data.id];  // Réinitialise la quantité
      this.toastr.warning('La quantité saisie dépasse la quantité disponible.');
    }
  }

  deselectAllItems(): void {
    this.selectedArticles.forEach((item: any) => {
      delete item.quantite;
      this.onCheckboxChange(item);
      item.isChecked = false;

    });

    this.selectedArticles = [];

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
