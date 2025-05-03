import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { FinanceService } from 'src/app/core/finance.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';
import {calculeDateEcheance, StatutCommande} from "../../../../utils/utils";

@Component({
  selector: 'app-validation-commande-client',
  templateUrl: './validation-commande-client.component.html',
  styleUrls: ['./validation-commande-client.component.scss'],
})
export class ValidationCommandeClientComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  commandClientForm!: FormGroup;
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
  totalPages: number;
  constructor(
    private articleService: ArticleServiceService,
    private utilisateurService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private _financeService: FinanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.commandClientForm = this.fb.group({
      clientId: [null, Validators.required],
      clientType: ['revendeur'],
      numeroCompte: [{ value: '', disabled: true }],
      raisonSociale: [{ value: '', disabled: true }],
      montantCredit: [{ value: '', disabled: true }],
      enCours: [''],
      soldeEmballage: [{ value: '', disabled: true }],
      numeroSAP: [{ value: '', disabled: true }],
      remise: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      contact: [{ value: '', disabled: true }],
      soldeLiquide: [{ value: '', disabled: true }],
      statutCompte: ['Ok'],
      fraisTransport: [0, Validators.required],
      articles: this.fb.array([]),
    });

    this.fetchData();

    this.articleService.ListPlastiquesNu.subscribe((res: any) => {
      this.dataListPlastiqueNu = res;
    });

    this.articleService.ListBouteilleVide.subscribe((res: any) => {
      this.dataListBouteilleVide = res;
    });

    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res;
      console.log(this.dataListProduits, 'this.dataListProduits ');
    });
    this.articleService.ListGroupesArticles.subscribe((res: any) => {
      this.dataListGroupeArticles = res;
    });
    this.GetListCommandeClient(1);
  }

  onDelete(item: any) {
    console.log(item);
  }
  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  onRevendeurChange(selectedItem: any): void {
    this.detailPointDevente = selectedItem;
    this.commandClientForm.controls['numeroCompte'].setValue(
      this.detailPointDevente.numeroCompteContribuable
    );
    this.commandClientForm.controls['raisonSociale'].setValue(
      this.detailPointDevente.raisonSocial
    );
    this.commandClientForm.controls['contact'].setValue(
      this.detailPointDevente.telephoneGerant
    );
    this.commandClientForm.controls['numeroSAP'].setValue(
      this.detailPointDevente.numeroSAP
    );

    this.commandClientForm.controls['montantCredit'].setValue(
      this.detailPointDevente.credits.totalCredit
    );
    this.commandClientForm.controls['soldeLiquide'].setValue(
      this.detailPointDevente.credits.creditLiquide
    );
    this.commandClientForm.controls['soldeEmballage'].setValue(
      this.detailPointDevente.credits.creditEmballage
    );
    console.log(this.detailPointDevente, 'detailPointDevente');
    console.log('Élément sélectionné :', selectedItem);
    console.log('commandClientForm:', this.commandClientForm.value);
    this.depotId = selectedItem.depot.id;
    this.GetArticleList(1);
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
    this.filteredArticleList = [];
    this.selectedArticles = [];
    this.totalQte=0
    this.totalLiquide=0
    this.totalEmballage = 0
    this.totalGlobal =0
  }
  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    this.commandClientForm.reset();
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
    this.updateData.dateEchanceCalculer = calculeDateEcheance(
      data?.createdAt,
      data?.credit?.delaiReglement
    );

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
  // calculeDateEcheance(date: string, delaiEnJours: number): string {
  //   const dateCreation = new Date(date);
  //   dateCreation.setDate(dateCreation.getDate() + delaiEnJours);
  //   const dateEcheance = dateCreation.toISOString().split('T')[0];
  //   return dateEcheance;
  // }
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
      this.dataListLiquides.forEach((item: any) => {
        this.GetStockDisponibleByDepot(item);
      });
      this.filteredArticleList = this.dataListLiquides;
      this._spinner.hide();
    });
  }

  applyRemise() {
    const remise = this.commandClientForm.get('remise')?.value || 0;
    const fraisTransport =
      this.commandClientForm.get('fraisTransport')?.value || 0;

    this.totalGlobalAfterRemise =
      this.totalGlobalBeforeRemise * (1 - remise / 100);

    this.totalGlobal = this.totalGlobalAfterRemise + fraisTransport;

    console.log('Montant global après remise :', this.totalGlobalAfterRemise);
    console.log('Montant final après frais de transport :', this.totalGlobal);
  }

  applyFraisTransport() {
    const remise = this.commandClientForm.get('remise')?.value || 0;
    const fraisTransport =
      this.commandClientForm.get('fraisTransport')?.value || 0;

    this.totalGlobalAfterRemise =
      this.totalGlobalBeforeRemise * (1 - remise / 100);

    this.totalGlobal = this.totalGlobalAfterRemise + fraisTransport;

    console.log('Montant final après frais de transport :', this.totalGlobal);
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

    this.applyRemise();
    console.log(data, 'data article');
    data.oldQuantite = data.quantite;
    this.articles.push(
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
    return this.commandClientForm.get('articles') as FormArray;
  }
  onSubmit(): void {
    const formData = this.commandClientForm.value;

    const payload = {
      clientType: this.detailPointDevente.credits.clientType,
      clientId: this.detailPointDevente.id,
      numeroCompte: this.detailPointDevente.numeroCompteContribuable,
      raisonSociale: this.detailPointDevente.raisonSocial,
      contact: this.detailPointDevente.telephoneGerant,
      montantCredit: parseInt(this.detailPointDevente.credits.totalCredit),
      soldeLiquide: parseInt(this.detailPointDevente.credits.creditLiquide),
      soldeEmballage: parseInt(this.detailPointDevente.credits.creditEmballage),
      statutCompte: formData.statutCompte,
      numeroSAP: this.detailPointDevente.numeroSAP,
      fraisTransport: formData.fraisTransport,
      enCours: parseInt(formData.enCours),
      remise: formData.remise,
      articles: formData.articles,
    };

    console.log('Données à envoyer au service :', payload);
    if (this.commandClientForm.valid) {
      this._spinner.show();
      this.articleService.CreateCommandClient(payload).then(
        (res: any) => {
          console.log(res, 'enregistré avec succes');
          this._spinner.hide();
          this.commandClientForm.reset();
          this.GetListCommandeClient(1);
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
  GetListCommandeClient(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetListCommandeClient(data).then((res: any) => {
      console.log('dataList:::>', res);
      this.totalPages = res.total * data.limit; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);

      this.dataList = res.data.filter(
        (x: any) => x.statut === StatutCommande.ATTENTE_VALIDATION
      );
      this._spinner.hide();
    });
  }
  ApprouverCommande(data: any) {
    if (data) {
      ALERT_QUESTION(
        'warning',
        'Attention !',
        'Voulez-vous approuver cette commande?'
      ).then((res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._financeService.ApprouverCommandeClient(data.id).then((res: any) => {
            console.log('VALIDEEEEEEEEEE:::>', res);
            this.toastr.success(res.message);
            this.OnCloseModal();
            this._spinner.hide();
            this.GetListCommandeClient(1);
          });
        } else {
          this.isModalOpen = false;
        }
      });
    }
  }
  selectArticle() {
    if(this.commandClientForm.controls['clientId'].valid)
    {
      this.isEditMode = false;
      this.isChoiceModalOpen = true;
      this.operation = 'create';
      if (!this.commandClientForm.controls['fraisTransport'].value) {
        this.commandClientForm.patchValue({ fraisTransport: 0 });
      }
      if (!this.commandClientForm.controls['remise'].value) {
        this.commandClientForm.patchValue({ remise: 0 });
      }
      this.cdr.detectChanges();
    }else{
      this.toastr.warning('Veuillez sélectionner le client.');
    }

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
    this.commandClientForm.patchValue({
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
    if (this.searchTerm) {
      this.filteredArticleList = this.dataListLiquides.filter(
        (article: any) =>
          article.libelle
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          article.code.toLowerCase().includes(this.searchTerm.toLowerCase())
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
      } else {
        console.error('Les données de plastiques ne sont pas un tableau');
      }

      this.listRevendeurs = this.listRevendeurs
        .filter((client: any) => client.credits != null)
        .map((client: any) => ({
          ...client,
          displayName: client.raisonSocial || client.nomEtablissement || 'N/A',
        }));
      console.log('Données combinées dans dataList:', this.listRevendeurs);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération des données:', error);
    }
  }
  protected readonly Number = Number;
}
