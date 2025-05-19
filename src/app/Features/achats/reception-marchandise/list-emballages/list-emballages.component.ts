import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';

@Component({
  selector: 'app-list-emballages',
  templateUrl: './list-emballages.component.html',
  styleUrls: ['./list-emballages.component.scss'],
})
export class ListEmballagesComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  emballageRenduForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  searchTerm: string = '';
  updateData: any = {};
  detailPointDevente: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  isChoiceModalOpen: boolean = false;
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any = [];
  dataListGroupeArticles: any = [];
  dataListBouteilleVide: any = [];
  dataListPlastiqueNu: any = [];
  selectedArticles: any = [];
  dataRevendeur: any = [];
  dataClient: any = [];
  dataPointDeVente: any = [];
  items: any = [];
  filteredArticleList: any[] = [];
  depotId: number = 0;
  // articles = [
  //   { id: 1, libelle: 'Article A', liquide: 500, emballage: 200, total: 700 },
  //   { id: 2, libelle: 'Article B', liquide: 800, emballage: 300, total: 1100 },
  //   { id: 3, libelle: 'Article C', liquide: 400, emballage: 100, total: 500 },
  // ];
  selectedArticle: any = [];
  dataListLiquides: any = [];
  stocksDisponibles: any = {};
  prixLiquide: any = {};
  prixEmballage: any = {};
  prixLiquideTotal: any = {};
  totalLiquide: number = 0;
  totalEmballage: number = 0;
  totalGlobal: number = 0;
  totalGlobalBeforeRemise: number = 0;
  totalQte: number = 0;
  prixEmballageTotal: any = {};
  montantTotal: any = {};
  clients: any = [];
  currentPage: number;
  rowsPerPage: any;
  listRevendeurs: any[] = [];
  totalGlobalAfterRemise: number = 0;
  prixLiquideArticleSelected: any;
  prixEmballageArticleSelected: any;
  ListCommandeClient: any;
  filters = {
    numeroRetour: '',
    dateDebut: '',
    dateFin: '',
  };
  constructor(
    private articleService: ArticleServiceService,
    private utilisateurService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.emballageRenduForm = this.fb.group({
      clientId: [null, Validators.required],
      clientType: ['revendeur'],
      numeroCompte: [{ value: '' }],
      raisonSociale: [{ value: 0, disabled: true }],
      montantCredit: [{ value: 0, disabled: true }],
      statutCompte: [{ value: '', disabled: true }],
      enCours: [{ value: 0, disabled: true }],
      soldeEmballage: [{ value: '', disabled: true }],
      numeroSAP: [{ value: '', disabled: true }],
      remise: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      contact: [{ value: '', disabled: true }],
      soldeLiquide: [{ value: '', disabled: true }],
      fraisTransport: [0, Validators.required],
      articles: this.fb.array([]),
    });

    this.fetchData();
    this.GetListRetourEmballageFournisseurs(1);

    this.GetArticleList(1);
  }

  onDelete(item: any) {
    console.log(item);
  }

  clear(table: Table) {
    table.clear();
  }

  OnCloseModal() {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.filteredArticleList = [];
    this.isModalOpen = false;
    this.selectedArticles = [];
    (this.emballageRenduForm.get('articles') as FormArray).clear();
  }
  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    this.emballageRenduForm.reset();
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    data.articles.forEach((article: any) => {
      this.totalEmballage += Number(article.montantEmballage);
      this.totalLiquide += Number(article.montantLiquide);
      this.totalGlobal = this.totalLiquide + this.totalEmballage;
      this.totalQte += article.quantite;
    });

    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetArticleList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetEmballageList(data).then((res: any) => {
      console.log('filteredArticleList:::>', res);
      this.dataListLiquides = res.data;
      // this.dataListLiquides.forEach((item: any) => {
      //   this.GetStockDisponibleByDepot(item);
      // });
      this.filteredArticleList = this.dataListLiquides;
      this._spinner.hide();
    });
  }

  removeArticle(item: any): void {
    item.isChecked = false;
    this.onCheckboxChange(item);

    const articlesControl = this.emballageRenduForm.controls[
      'articles'
    ] as FormArray;
    const articlesValue = articlesControl.value || [];

    // Trouver l'article à retirer
    const articleToRemove = articlesValue.find(
      (i: any) => i.codeArticleLiquide === item.reference
    );

    if (articleToRemove) {
      // Calcul des totaux à retirer
      const quantite = articleToRemove.quantite;
      const prixLiquide = this.prixLiquide[articleToRemove.codeArticleLiquide];
      const prixEmballage =
        this.prixEmballage[articleToRemove.codeArticleEmballage];
      const montantTotal = (prixLiquide + prixEmballage) * quantite;

      // Soustraire les valeurs des totaux
      this.totalEmballage -= prixEmballage * quantite || 0;
      this.totalLiquide -= prixLiquide * quantite || 0;
      this.totalGlobalBeforeRemise -= montantTotal || 0;
      this.totalQte -= quantite;

      // Retirer l'article de la liste
      const updatedArticles = articlesValue.filter(
        (i: any) => i.codeArticleLiquide !== item.reference
      );

      // Vider le FormArray actuel
      while (articlesControl.length !== 0) {
        articlesControl.removeAt(0);
      }

      // Ajouter les éléments mis à jour dans le FormArray
      updatedArticles.forEach((article: any) => {
        articlesControl.push(this.fb.group(article)); // Assuming fb is FormBuilder
      });

      // Forcer la mise à jour de la validité
      articlesControl.updateValueAndValidity();

      console.log('Articles après suppression :', updatedArticles);

      // Appliquer la remise sans recalculer les prix
    }
  }

  calculatePrix(data: any) {
    if (this.prixLiquideTotal[data.id]) {
      this.totalEmballage -= this.prixEmballageTotal[data.id] || 0;
      this.totalLiquide -= this.prixLiquideTotal[data.id] || 0;
      this.totalGlobalBeforeRemise -= this.montantTotal[data.id] || 0;
      this.totalQte -= data.oldQuantite || 0;
    }

    this.prixLiquideTotal[data.id] = data.quantite * this.prixLiquide[data.id];
    this.prixEmballageTotal[data.id] =
      data.quantite * this.prixEmballage[data.id];
    this.montantTotal[data.id] =
      this.prixLiquideTotal[data.id] + this.prixEmballageTotal[data.id];

    this.totalEmballage += this.prixEmballageTotal[data.id];
    this.totalLiquide += this.prixLiquideTotal[data.id];
    this.totalGlobalBeforeRemise += this.montantTotal[data.id];
    this.totalQte += data.quantite;

    console.log(data, 'data article');
    data.oldQuantite = data.quantite;

    // Accéder aux valeurs du FormArray
    const articlesControl = this.emballageRenduForm.controls[
      'articles'
    ] as FormArray;
    const articlesValue = articlesControl.value;

    // Vérifier si l'article existe déjà dans 'this.articles' (articlesValue)
    const existingArticleIndex = articlesValue.findIndex(
      (item: any) => item.codeArticleLiquide === data.liquide.code
    );

    if (existingArticleIndex !== -1) {
      // Si l'article existe, on met à jour sa quantité et son prix
      articlesControl.at(existingArticleIndex).patchValue({
        quantite: data.quantite,
        prixUnitaireLiquide: this.prixLiquide[data.id],
        prixUnitaireEmballage: this.prixEmballage[data.id],
      });
    } else {
      // Sinon, on ajoute un nouvel article
      articlesControl.push(
        this.fb.group({
          groupeArticleId: data.groupearticle.id,
          codeArticleLiquide: data.liquide.code,
          codeArticleEmballage: data.liquide.emballage.code,
          prixUnitaireLiquide: this.prixLiquide[data.id],
          prixUnitaireEmballage: this.prixEmballage[data.id],
          quantite: data.quantite,
        })
      );
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

  get articles(): FormArray {
    return this.emballageRenduForm.get('articles') as FormArray;
  }
  onSubmit(): void {
    const payload = {
      // receptionId: this.dataList.,
      articlesRecus: this.selectedArticles.map((article: any) => {
        return {
          quantite: article?.quantiteAffectee,
          prixUnitaireEmballage: article?.prixUnitaireEmballage,
          emballageId: article?.emballage?.id,
        };
      }),
    };

    // if (this.emballageRenduForm.valid) {
      this._spinner.show();
      this.articleService.CreateCommandClient(payload).then(
        (res: any) => {
          console.log(res, 'enregistré avec succes');
          this._spinner.hide();
          this.emballageRenduForm.reset();
          this.GetListRetourEmballageFournisseurs(1);
          this.OnCloseModal();
          this.toastr.success(res.message);
        },
        (error: any) => {
          this._spinner.hide();
          this.toastr.info(error.error.message);
          console.error('Erreur lors de la création', error);
        }
      );
    // } else {
    //   this.toastr.warning('Formulaire invalide');
    // }
  }

  filterGlobal() {
    this.GetListRetourEmballageFournisseurs(
      1,
      this.filters.dateDebut,
      this.filters.dateFin,
      this.filters.numeroRetour
    );
  }
  GetListRetourEmballageFournisseurs(
    page: number,
    numeroRetour?: string,
    dateDebut?: string,
    dateFin?: string
  ) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      numeroRetour: numeroRetour || '',
      dateDebut: dateDebut || '',
      dateFin: dateFin || '',
    };
    this._spinner.show();
    this.articleService
      .GetListRetourEmballageFournisseurs(data)
      .then((res: any) => {
        console.log('dataList:::>', res);
        this.dataList = res.data;
        this._spinner.hide();
      });
  }
  selectArticle() {
    this.isEditMode = false;
    this.isChoiceModalOpen = true;
    this.operation = 'create';
    this.cdr.detectChanges();
    console.log(this.isChoiceModalOpen);
  }
  validateQuantite(data: any): void {
    console.log(data, 'validateQuantiteData');

    // Vérifier si la quantité saisie dépasse la quantité disponible
    if (data.quantite > this.stocksDisponibles[data.liquide.id]) {
      // Réinitialiser la quantité à la quantité disponible
      data.quantite = '';

      // Afficher un message de warning
      this.toastr.warning('La quantité saisie dépasse la quantité disponible.');
    } else {
      this.calculatePrix(data);
    }
  }

  onCheckboxChange(article: any): void {
    this.GetPrixByArticle(article);
    // this.GetStockDisponibleByDepot(article)
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
    console.log(this.selectedArticles, 'selectedArticles');
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
        // this.prixLiquideArticleSelected =  this.prixEmballage[item.id]
        // this.prixEmballageArticleSelected =  this.prixLiquide[item.id]
        console.log('prixByArticle', this.prixLiquide[item.id]);
      }
    } catch (error: any) {
      console.log(error);
    }
  }
  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }

  onSubmitSelection() {
    this.isChoiceModalOpen = false;
  }
  OnCloseChoiceModal() {
    this.deselectAllItems();
    this.isChoiceModalOpen = false;
    console.log(this.isModalOpen);
    // this.filteredArticleList = []
  }
  deselectAllItems(): void {
    this.selectedArticles.forEach((item: any) => {
      delete item.quantite;
      this.onCheckboxChange(item);
      item.isChecked = false;
    });

    this.selectedArticles = [];
  }
  // onSearchClient(): void {}
  loadArticleDetails(): void {
    this.emballageRenduForm.patchValue({
      photo: this.updateData.photo ?? '',
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      Conditionnement: this.updateData.Conditionnement,
      categorieId: this.updateData.categorieproduit.id,
      groupeId: this.updateData.groupearticle.id,
      plastiquenuId: this.updateData.plastiquenu.id,
      bouteillevideId: this.updateData.bouteillevide.id,
      liquideId: 1,
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetArticleList(this.currentPage);
  }

  filterArticles(): void {
    console.log(this.searchTerm);
    console.log(this.dataListLiquides, 'dataListLiquides');
    console.log(this.filteredArticleList, 'filteredArticleList');
    if (this.searchTerm) {
      this.filteredArticleList = this.dataListLiquides.filter(
        (article: any) =>
          article.libelle
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          article.reference
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
      console.log(this.filteredArticleList);
    } else {
      this.filteredArticleList = [...this.dataListLiquides];
    }
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res: any) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetArticleList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }

  async fetchData() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    try {
      // Effectuer les deux appels API en parallèle
      const [revendeur, pointDeVente]: [any, any] = await Promise.all([
        this.articleService.GetListRevendeur(data), // Remplacez par votre méthode API
        this.utilisateurService.GetPointDeVenteList(data),
      ]);

      console.log('Données revendeur:', revendeur);
      console.log('Données pointDeVente:', pointDeVente);
      // Vérifier si plastiques et liquides sont bien des tableaux
      if (Array.isArray(revendeur.data)) {
        this.dataRevendeur = revendeur.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.listRevendeurs.push(...revendeur.data);
        console.log('Données listRevendeurs:', this.listRevendeurs);
      } else {
        console.error('Les données de plastiques ne sont pas un tableau');
      }

      this.listRevendeurs = this.listRevendeurs
        .filter((client: any) => client.credit != null)
        .map((client: any) => ({
          ...client,
          displayName: client.raisonSocial || 'N/A',
        }));
      console.log('Données combinées dans dataList:', this.listRevendeurs);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération des données:', error);
    }
  }
  protected readonly Number = Number;
}
