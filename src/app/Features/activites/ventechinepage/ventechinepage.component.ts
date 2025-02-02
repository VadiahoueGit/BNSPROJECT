import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ArticleServiceService } from '../../../core/article-service.service';
import { ActiviteService } from '../../../core/activite.service';
import { UtilisateurResolveService } from '../../../core/utilisateur-resolve.service';
import { CoreServiceService } from '../../../core/core-service.service';
import { LogistiqueService } from '../../../core/logistique.service';

@Component({
  selector: 'app-ventechinepage',
  templateUrl: './ventechinepage.component.html',
  styleUrls: ['./ventechinepage.component.scss'],
})
export class VentechinepageComponent {
  groupeProduitForm!: FormGroup;
  dataList: [];
  VenteForm: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  isChoiceModalOpen: boolean;
  isEditMode: boolean;
  operation: string = '';
  currentPage: number;
  rowsPerPage: any;
  searchTerm: string = '';
  filteredArticleList: any[] = [];
  selectedArticles: any[] = [];
  dataListLiquides: any = [];
  stocksDisponibles: any = {};
  prixLiquide: any = {};
  prixEmballage: any = {};
  prixLiquideTotal: any = {};
  totalLiquide: number = 0;
  totalEmballage: number = 0;
  totalGlobal: number = 0;
  totalQte: number = 0;
  prixEmballageTotal: any = {};
  montantTotal: any = {};
  dataListZone: any;
  dataListCommercial: any;
  dataListCamion: any;
  depotId: number = 0;
  updateData: any = {};
  venteId: any = 0;
  constructor(
    private _spinner: NgxSpinnerService,
    private articleService: ArticleServiceService,
    private logistiqueService: LogistiqueService,
    private coreService: CoreServiceService,
    private utilisateurService: UtilisateurResolveService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.groupeProduitForm = this.fb.group({
      libelle: ['', Validators.required],
      code: ['', Validators.required],
    });
    this.VenteForm = this.fb.group({
      commercialId: [null, Validators.required],
      zoneDeLivraisonId: [null, Validators.required],
      venteDate: [null, Validators.required],
      vehiculeId: [0, Validators.required],
      articles: this.fb.array([]),
    });

    this.GetArticleList(1);
    this.GetCommercialList(1);
    this.GetZoneList(1);
    this.GetCamionList(1);
    this.GetVenteChineList(1);
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  onCommercialChange(selectedItem: any): void {
    console.log('Élément sélectionné :', selectedItem);
    this.depotId = selectedItem.depot.id;
    this.GetArticleList(1);
  }
  selectArticle() {
    this.isEditMode = false;
    this.isChoiceModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnCreate() {
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  onSubmit() {
    console.log(this.VenteForm.value,'venteForm')
    if (this.VenteForm.valid) {
      this._spinner.show();
      this.utilisateurService.CreateVenteChine(this.VenteForm.value).then(
        (res: any) => {
          console.log(res, 'enregistré avec succes');
          this._spinner.hide();
          this.VenteForm.reset();
          this.GetVenteChineList(1);
          this.OnCloseModal();
          this.toastr.success(res.message);
        },
        (error: any) => {
          this._spinner.hide();
          this.toastr.info(error.error.message);
          console.error('Erreur lors de la création', error);
        }
      );
    } else {
      this.toastr.warning('Formulaire invalide');
    }
  }

  onCheckboxChange(article: any): void {
    this.GetPrixByArticle(article);
    this.GetStockDisponibleByDepot(article);
    if (article.isChecked) {
      this.selectedArticles.push(article);
      this.afficherArticlesSelectionnes();
    } else {
      delete article.quantite;
      const indexToRemove = this.selectedArticles.findIndex(
        (selectedArticle: any) => selectedArticle.libelle === article.libelle
      );
      if (indexToRemove !== -1) {
        this.selectedArticles.splice(indexToRemove, 1);
        this.afficherArticlesSelectionnes();
      }
    }
  }

  async GetStockDisponibleByDepot(item: any): Promise<any> {
    let data = {
      productId: item.liquide.code,
      depotId: this.depotId,
    };

    try {
      // Attendre la réponse de la promesse
      const response: any = await this.articleService.GetStockDisponibleByDepot(
        data
      );
      console.log(response);
      // Vérifier si le statusCode est 200
      if (response) {
        this.stocksDisponibles[item.liquide.id] = response.quantiteDisponible;
        console.log(this.stocksDisponibles[item.liquide.id]);
      } else if (response.statusCode === 404) {
        this.stocksDisponibles[item.liquide.id] = 0; // Si le code est 404, retourner 0
      } else {
        return null; // Si un autre code, retourner null ou une valeur par défaut
      }
    } catch (error: any) {
      console.log(error);
      if (error.status === 404) {
        this.stocksDisponibles[item.liquide.id] = 0; // Si le code est 404, retourner 0
      }
    }
  }

  removeArticle(item: any): void {
    item.isChecked = false;
    this.onCheckboxChange(item);
    const index = this.selectedArticles.findIndex((i: any) => i.id === item.id);

    if (index !== -1) {
      this.selectedArticles = this.selectedArticles
        .slice(0, index)
        .concat(this.selectedArticles.slice(index + 1));
    }
  }

  onSubmitSelection() {
    this.isChoiceModalOpen = false;
  }

  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }

  filterArticles(): void {
    console.log(this.searchTerm);
    if (this.searchTerm) {
      this.filteredArticleList = this.dataListLiquides.filter(
        (article: any) => {
          console.log('dataListLiquides', article);

          const libelle = article?.libelle || ''; // Utiliser une valeur par défaut si libelle est undefined
          const code = article?.code || ''; // Utiliser une valeur par défaut si code est undefined

          // Vérification sécurisée avant d'utiliser toLowerCase()
          return (
            libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            code.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
        }
      );

      console.log(this.filteredArticleList);
    } else {
      this.filteredArticleList = [...this.dataListLiquides];
    }
  }

  OnCloseChoiceModal() {
    this.deselectAllItems();
    this.isChoiceModalOpen = false;
    console.log(this.isModalOpen);
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    // this.GetArticleList(this.currentPage);
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
      this.dataListLiquides = res.data;
      this.filteredArticleList = this.dataListLiquides;
      this._spinner.hide();
    });
  }
  OnEdit(data:any) {
    this.totalEmballage = 0;
    this.totalLiquide  = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isEditMode = true;
    console.log(data,'updateData');
    this.updateData = data;
    this.updateData.articles.map((article:any) =>{
      article.prixTotal = parseInt(article.prixUnitaireLiquide )+ parseInt(article.prixUnitaireEmballage);
    })
    console.log(this.updateData.articles,'this.updateData.articles');

    data.articles.forEach((article:any) => {
      this.totalEmballage += Number(article.montantEmballage);
      this.totalLiquide  += Number(article.montantLiquide);
      this.totalGlobal = this.totalLiquide + this.totalEmballage
      this.totalQte += article.quantite
    })

    this.venteId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  OnDelete(id: number) {}
  GetVenteChineList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.utilisateurService.GetVenteChineList(data).then((res: any) => {
      console.log('GetVenteChineList:::>', res.data);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }

  GetCommercialList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.utilisateurService.GetCommercialList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListCommercial = res.data;
      this.dataListCommercial = this.dataListCommercial.map((item: any) => ({
        ...item,
        fullLabel: `${item.nom} ${item.prenom}`,
      }));
      this._spinner.hide();
    });
  }

  GetZoneList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetZoneList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListZone = res.data;
      this._spinner.hide();
    });
  }

  GetCamionList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.logistiqueService.GetVehiculeList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListCamion = res.data;
      this._spinner.hide();
    });
  }

  validateQuantite(data: any): void {
    // Vérifier si la quantité saisie dépasse la quantité disponible
    if (data.quantite > this.stocksDisponibles[data.id]) {
      // Réinitialiser la quantité à la quantité disponible
      data.quantite = '';
      // Afficher un message de warning
      this.toastr.warning('La quantité saisie dépasse la quantité disponible.');
    } else {
      this.calculatePrix(data);
    }
  }
  get articles(): FormArray {
    return this.VenteForm.get('articles') as FormArray;
  }
  calculatePrix(data: any) {
    if (this.prixLiquideTotal[data.id]) {
      this.totalEmballage -= this.prixEmballageTotal[data.id] || 0;
      this.totalLiquide -= this.prixLiquideTotal[data.id] || 0;
      this.totalGlobal -= this.montantTotal[data.id] || 0;
      this.totalQte -= data.oldQuantite || 0;
    }
    this.prixLiquideTotal[data.id] = data.quantite * this.prixLiquide[data.id];
    this.prixEmballageTotal[data.id] =
      data.quantite * this.prixEmballage[data.id];
    this.montantTotal[data.id] =
      this.prixLiquideTotal[data.id] + this.prixEmballageTotal[data.id];

    this.totalEmballage += this.prixEmballageTotal[data.id];
    this.totalLiquide += this.prixLiquideTotal[data.id];
    this.totalGlobal += this.montantTotal[data.id];
    this.totalQte += data.quantite;

    data.oldQuantite = data.quantite;
    console.log(data);
    this.articles.push(
      this.fb.group({
        codeArticleLiquide: data.liquide.code,
        codeArticleEmballage: data.liquide.emballage.code,
        prixUnitaireLiquide: this.prixLiquide[data.id],
        prixUnitaireEmballage: this.prixEmballage[data.id],
        quantite: data.quantite,
      })
    );
  }

  async GetPrixByArticle(item: any): Promise<any> {
    let data = {
      id: item.id,
    };

    try {
      // Attendre la réponse de la promesse
      const response: any = await this.articleService.GetPrixByProduit(data);
      console.log(response);
      // Vérifier si le statusCode est 200
      if (response.data) {
        this.prixLiquide[item.id] = response.data.PrixLiquide;
        this.prixEmballage[item.id] = response.data.PrixConsigne;
        console.log('prixByArticle', this.prixLiquide[item.id]);
      }
    } catch (error: any) {
      console.log(error);
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
}
