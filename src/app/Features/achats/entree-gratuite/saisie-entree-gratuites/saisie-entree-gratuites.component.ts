import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';
import { StatutCommande, TypeCommandeFournisseur } from 'src/app/utils/utils';
import { ConfigService } from "../../../../core/config-service.service";

@Component({
  selector: 'app-saisie-entree-gratuites',
  templateUrl: './saisie-entree-gratuites.component.html',
  styleUrls: ['./saisie-entree-gratuites.component.scss'],
})
export class SaisieEntreeGratuitesComponent {
  @ViewChild('dt2') dt2!: Table;
  @Input() ListenMode : boolean = false
  statuses!: any[];
  dataList: any[] = [];
  selectedArticles: any[] = [];
  pointDeVente!: any[];
  CommandeForm!: FormGroup;
  isChoiceModalOpen: boolean;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  searchTerm: string = '';
  filteredArticleList: any[] = [];
  dataListLiquides: any = [];
  dataListPlastiqueNu: any = [];
  dataListEmballage: any = [];
  dataListArticlesProduits: any = [];
  currentPage: number;
  rowsPerPage: any;
  newCommande: any[] = [];
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
  selectedOption: string = '';
  listRevendeurs: any[] = [];
  dataRevendeur: any[] = [];
  dataDepot: any[] = [];
  ListEntreeGratuite: any[] = [];
  depotId: any = 0;
  totalPages: number = 0;
  minDate = new Date().toISOString().split('T')[0];
  now = new Date().toISOString().split('T')[0];
  Listfournisseurs: any[] = [];
  depotList: any;
  filters: any = {
    numeroEntree: '',
    dateDebut: '',
    dateFin: '',
  };
  docUrl = ''
  public dataSendedToReceptionMarchandiseRequest = {
    commandeId: 0,
    numeroBonLivraison: '',
    articlesRecus: [],
    emballagesRendus: [],
  };
  articlesRecues: any;
  constructor(
    private cdr: ChangeDetectorRef,
    private _coreService: CoreServiceService,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private utilisateurService: UtilisateurResolveService,
    private _config: ConfigService
  ) {}

  ngOnInit() {
    this.CommandeForm = this.fb.group({
      fournisseur: [null, Validators.required],
      dateReception: [this.minDate, Validators.required],
      depot: [null, Validators.required],
      articles: this.fb.array([]),
    });

    this.CommandeForm.controls['dateReception'].setValue(this.now);
    this.GetArticleList(1);
    this.GetFournisseursList();
    this.GetListEntreeGratuite(1);
    // this.fetchData()
    this.GetDepotList(1);
    this.docUrl = this._config.docUrl;
  }

  GetArticleList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('GetArticleList:::>', res);
      this.dataListLiquides = res.data;
      // this.dataListLiquides.forEach((item: any) => {
      //   this.GetStockDisponibleByDepot(item)
      // })
      this.filteredArticleList = this.dataListLiquides;
      this._spinner.hide();
    });
  }

  GetListEntreeGratuite(
    page: number,
    numeroEntree?: string,
    dateDebut?: string,
    dateFin?: string
  ) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      numeroEntree: numeroEntree || '',
      dateDebut: dateDebut || '',
      dateFin: dateFin || '',
    };
    console.log(data,'data')

    this._spinner.show();
    this.articleService.GetListEntreeGratuite(data).then((res: any) => {
      console.log('GetListEntreeGratuite:::>', res);
      this.totalPages = res.total;
      this.ListEntreeGratuite = res.data;
      this._spinner.hide();
    });
  }

  filterGlobal() {
    this.GetListEntreeGratuite(
      1,
      this.filters.numeroEntree,
      this.filters.dateDebut,
      this.filters.dateFin
    );
    console.log(this.filters,'filters')
  }

  change(event: any) {
    if (event.groupeClient) {
      this.selectedOption = event.groupeClient.nomGroupe;
      console.log(this.selectedOption);
    }
  }

  OnCloseModal() {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.filteredArticleList = [];
    this.isModalOpen = false;
    this.selectedArticles = [];
    (this.CommandeForm.get('articles') as FormArray).clear();
    console.log(this.isModalOpen);
  }

  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  selectArticle() {
    this.isEditMode = false;
    this.isChoiceModalOpen = true;
    this.operation = this.ListenMode ? 'edit' : 'create';
    console.log(this.isModalOpen);
  }
  removeArticleEmballage(item: any): void {
    const indexToRemove = this.articlesRecues.findIndex(
      (selectedArticle: any) => selectedArticle.libelle === item.libelle
    );
    if (indexToRemove !== -1) {
      this.articlesRecues.splice(indexToRemove, 1);
      this.afficherArticlesSelectionnes();
    }
  }
  selectArticleNew() {
    this.isEditMode = false;
    this.isChoiceModalOpen = true;
    this.operation = 'createNew';
    console.log(this.isModalOpen);
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    data.articles.map((item: any) => {
      item.isNewAdd = false;
    });
    this.articlesRecues = data.articles;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
  }

  onSubmit(): void {
    if (this.CommandeForm.valid) {
      let payload = {};
      payload = {
        fournisseur: this.CommandeForm.controls['fournisseur'].value,
        dateReception: this.CommandeForm.controls['dateReception'].value,
        depot: this.CommandeForm.controls['depot'].value,
        articles: this.selectedArticles.map((article: any) => {
          console.log(article, 'article');
          return {
            groupearticle: article.groupearticle?.id,
            liquide: article?.liquide?.id,
            emballage: article?.liquide?.emballage?.id,
            quantite: article?.quantite,
          };
        }),
      };
      this._spinner.show();
      this.articleService.CreateEntreeGratuite(payload).then(
        (res: any) => {
          console.log(res, 'enregistré avec succes');
          this._spinner.hide();
          this.CommandeForm.reset();
          this.GetListEntreeGratuite(1);
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
  onValidate(){
    const payload = {
      commandeId: this.updateData.id,
      numeroBonLivraison:
      this.dataSendedToReceptionMarchandiseRequest.numeroBonLivraison,
  
      scanBonLivraison: 'https://monserveur.com/uploads/bon_livraison_001.pdf',
      articlesRecus: this.articlesRecues.map((article: any) => {
        const prixSousDistributeur = article.prix?.find(
          (p: any) => p.typePrix?.libelle === 'PRIX S/DISTRIBUTEUR'
        );
        return {
          articleCommandeId: article?.id,
          quantiteRecue: article?.quantite,
          liquideId: article?.liquide?.id,
          emballageId:
            article?.liquide?.emballage?.id ?? article?.emballage?.id,
          prixUnitaireLiquide: prixSousDistributeur?.PrixConsigne ?? parseInt(article?.prixUnitaireLiquide),
          prixUnitaireEmballage: prixSousDistributeur?.PrixConsigne ?? parseInt(article?.prixUnitaireEmballage),
          commentaireEcart: article.commentaireEcart || '',
        };
      }),
    };
    console.log(payload, 'payload');

    if (payload) {
      this._spinner.show();
      this.articleService.CreateReceptionCommandeFournisseurs(payload).then(
        (res: any) => {
          console.log(res, 'enregistré avec succes');
          this._spinner.hide();
          this.GetListEntreeGratuite(1);
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
  GetFournisseursList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.utilisateurService.GetFournisseursList(data).then(
      (res: any) => {
        this.Listfournisseurs = res.data;
        console.log('Listfournisseurs', res);
      },
      (error: any) => {
        this._spinner.hide();
      }
    );
  }

  onCheckboxChange(article: any): void {
    // this.GetPrixByArticle(article)
    if (article.isChecked) {
      article.isNewAdd = true;
      this.articlesRecues.push(article);
      // this.newCommande = this.articlesRecues
      this.afficherArticlesSelectionnes();
    } else {
      article.isNewAdd = false;
      delete article.quantite;
      const indexToRemove = this.articlesRecues.findIndex(
        (selectedArticle: any) => selectedArticle.libelle === article.libelle
      );
      if (indexToRemove !== -1) {
        this.articlesRecues.splice(indexToRemove, 1);
        this.afficherArticlesSelectionnes();
      }
    }
  }

  removeArticle(item: any): void {
    item.isNewAdd = false;
    // Créer une copie de l'article avec la quantité définie à 0
    const data = {
      ...item,
      quantite: 0,
      groupearticle: { id: item.groupearticle.id },
      id: item.groupearticle.id, // Assurez-vous que l'ID correspond
    };

    // Mettre à jour l'état de l'article à 'non sélectionné'
    item.isChecked = false;

    // Calculer les prix en passant l'article avec quantité 0 (pour gestion des totaux)
    this.calculatePrix(data);

    // Gérer le changement de la case à cocher
    this.onCheckboxChange(item);

    // Supprimer l'article de la liste `selectedArticles`
    const index = this.selectedArticles.findIndex((i: any) => i.id === item.id);

    if (index !== -1) {
      // Suppression de l'article de la liste
      this.selectedArticles = this.selectedArticles
        .slice(0, index)
        .concat(this.selectedArticles.slice(index + 1));
    }

    // Optionnel : si tu as d'autres actions liées à la suppression, ajoute-les ici
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

  OnCloseChoiceModal() {
    this.deselectAllItems();
    this.isChoiceModalOpen = false;
    console.log(this.isModalOpen);
  }

  deselectAllItems(): void {
    this.selectedArticles.forEach((item: any) => {
      delete item.quantite;
      this.onCheckboxChange(item);
      item.isChecked = false;
    });

    this.selectedArticles = [];
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetListEntreeGratuite(this.currentPage);
  }

  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res: any) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }


  validateQuantite(data: any): void {
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

  get articles(): FormArray {
    return this.CommandeForm.get('articles') as FormArray;
  }

  calculatePrix(data: any) {
    console.log('DATA:::>', data);

    const prixLiquide = this.prixLiquide[data.id] || 0;
    const prixEmballage = this.prixEmballage[data.id] || 0;
    const quantite = data.quantite || 0;
    console.log('groupearticle:::>', data.groupearticle.id);

    const existingArticleIndex = this.articles.controls.findIndex(
      (control: any) => control.value.codeArticleLiquide === data.liquide.code
    );

    if (existingArticleIndex !== -1) {
      // Si l'article existe, on le modifie
      const existingArticle = this.articles.at(existingArticleIndex).value;
      const oldQuantite = existingArticle.quantite || 0;
      const differenceQuantite = quantite - oldQuantite;

      // ✅ Décrémentation des anciens totaux
      this.totalEmballage -= oldQuantite * prixEmballage;
      this.totalLiquide -= oldQuantite * prixLiquide;
      this.totalQte -= oldQuantite;

      console.log(this.totalEmballage, oldQuantite, '*', prixEmballage);
      console.log(this.totalLiquide, oldQuantite, '*', prixLiquide);
      console.log(this.totalQte);

      // ✅ Suppression si la quantité est 0
      if (quantite === 0) {
        // Si la quantité est 0, on supprime l'article
        this.articles.removeAt(existingArticleIndex);
        delete this.prixEmballageTotal[data.id];
        delete this.prixLiquideTotal[data.id];
        delete this.montantTotal[data.id];
      } else {
        // ✅ Mise à jour des totaux avec les nouvelles quantités
        this.prixLiquideTotal[data.id] = quantite * prixLiquide;
        this.prixEmballageTotal[data.id] = quantite * prixEmballage;

        this.totalEmballage += this.prixEmballageTotal[data.id];
        this.totalLiquide += this.prixLiquideTotal[data.id];
        this.totalQte += quantite;

        // Mise à jour de la quantité de l'article dans le formulaire
        this.articles.at(existingArticleIndex).patchValue({
          quantite: quantite,
        });
      }
    } else {
      // ✅ Ajout d'un nouvel article
      this.prixLiquideTotal[data.id] = quantite * prixLiquide;
      this.prixEmballageTotal[data.id] = quantite * prixEmballage;

      this.totalEmballage += this.prixEmballageTotal[data.id];
      this.totalLiquide += this.prixLiquideTotal[data.id];
      this.totalQte += quantite;

      this.articles.push(
        this.fb.group({
          groupeArticleId: data.groupearticle.id,
          codeArticleLiquide: data.liquide.code,
          codeArticleEmballage: data.liquide.emballage
            ? data.liquide.emballage.code
            : data.emballage.code,
          prixUnitaireLiquide: prixLiquide,
          prixUnitaireEmballage: prixEmballage,
          quantite: quantite,
        })
      );
    }

    // ✅ Recalcul des montants
    this.montantTotal[data.id] =
      (this.prixLiquideTotal[data.id] || 0) +
      (this.prixEmballageTotal[data.id] || 0);

    // ✅ Mise à jour des totaux globaux
    this.totalEmballage = this.articles.controls.reduce(
      (acc, control) =>
        acc + control.value.prixUnitaireEmballage * control.value.quantite,
      0
    );
    this.totalLiquide = this.articles.controls.reduce(
      (acc, control) =>
        acc + control.value.prixUnitaireLiquide * control.value.quantite,
      0
    );
    this.totalQte = this.articles.controls.reduce(
      (acc, control) => acc + control.value.quantite,
      0
    );
    this.totalGlobal = this.totalEmballage + this.totalLiquide;

    console.log('Totaux:', {
      totalLiquide: this.totalLiquide,
      totalEmballage: this.totalEmballage,
      montantTotal: this.montantTotal[data.id],
      totalGlobal: this.totalGlobal,
      totalQte: this.totalQte,
    });

    // Forcer le rafraîchissement de l'interface
    this.cdr.detectChanges();
  }
  imprimer(path:any) {
    window.open(this.docUrl+path, '_blank');
  }
  GetDepotList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetDepotList(data).then((res: any) => {
      console.log('depotList:::>', res);
      this.depotList = res.data;
      this.totalPages = res.total;
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
      const [depot, revendeur]: [any, any] = await Promise.all([
        this._coreService.GetDepotList(data),
        this.articleService.GetListRevendeur(data), // Remplacez par votre méthode API
      ]);

      console.log('Données pointDeVente:', depot);
      // Vérifier si plastiques et liquides sont bien des tableaux
      if (Array.isArray(revendeur.data)) {
        this.dataRevendeur = revendeur.data.filter(
          (rev: any) =>
            rev.groupeClient.nomGroupe === 'Sous Distributeur' &&
            rev.credit != null
        );
        console.log('Données revendeur:', this.dataRevendeur);
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.listRevendeurs.push(...this.dataRevendeur);
      } else {
        console.error('Les données de plastiques ne sont pas un tableau');
      }

      if (Array.isArray(depot.data)) {
        this.dataDepot = depot.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.listRevendeurs.push(...depot.data);
      } else {
        console.error('Les données de liquides ne sont pas un tableau');
      }

      this.listRevendeurs = this.listRevendeurs
        // .filter((client:any) => client.credit != null)
        .map((client: any) => ({
          ...client,
          displayName: client.raisonSocial || client.nomDepot || 'N/A',
        }))
        .filter(
          (client: any, index: number, self: any[]) =>
            self.findIndex((c: any) => c.id === client.id) === index
        );
      console.log('Données combinées dans dataList:', this.listRevendeurs);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération des données:', error);
    }
  }
  async getLocalPrice(item: any) {
    this.prixLiquide[item.id] = item.prixUnitaireLiquide;
    this.prixEmballage[item.id] = item.prixUnitaireEmballage;
    this.calculatePrix(item);
  }
  // UpdateCommandeFournisseurs(){
  //   const data = this.newCommande.map((item: any) => ({
  //     id: item.id,
  //     groupeArticleId: item.groupearticle.id,
  //     codeArticleLiquide: item.liquide.code,
  //     codeArticleEmballage: item.emballage.code,
  //     prixUnitaireLiquide: Number(this.prixLiquide[item.id]),
  //     prixUnitaireEmballage: Number(this.prixEmballage[item.id]),
  //     quantite: Number(item.quantite) || 0,
  //   })).filter((item: any) => item.quantite != 0);

  //   const payload = {
  //     revendeurId:this.updateData.revendeur.id,
  //     articles: data
  //   };
  //   this.articleService.UpdateCommandeFournisseurs(this.updateData.id, payload).then(
  //     (response: any) => {
  //       this._spinner.hide();
  //       this.toastr.success(response.message);
  //       this.GetListEntreeGratuiteById()
  //       this.operation = 'edit';
  //     },
  //     (error: any) => {
  //       this._spinner.hide();
  //       this.toastr.error('Erreur!', 'Erreur lors de la modification.');
  //     }
  //   );

  // }
  OnAddGoods(data: any, newCommande: any) {
    let item = [];
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    if (data == 'edit') {
      this.operation = 'createNew';
    } else {
      this.operation = 'edit';
    }
  }

  // saveGoods(data: any) {
  //   if(data == 'createNew') {
  //     console.log(data)
  //     this.AjouterCommandeFournisseurs()
  //   }else if(data == 'update') {
  //     console.log(data)
  //     this.UpdateCommandeFournisseurs()
  //   }

  //   console.log(this.operation);
  // }
  // AjouterCommandeFournisseurs() {
  //   const data = this.newCommande.map((item: any) => ({
  //     id: item.id,
  //     groupeArticleId: item.groupearticle.id,
  //     codeArticleLiquide: item.liquide.code,
  //     codeArticleEmballage: item.liquide.emballage.code,
  //     prixUnitaireLiquide: this.prixLiquide[item.id],
  //     prixUnitaireEmballage: this.prixEmballage[item.id],
  //     quantite: item.quantite,
  //   }));

  //   const payload = {
  //     articles: data
  //   };

  //   this._spinner.show();
  //   this.articleService.AjouterCommandeFournisseurs(this.updateData.id, payload).then(
  //     (response: any) => {
  //       this._spinner.hide();
  //       this.toastr.success(response.message);
  //       this.GetListEntreeGratuiteById()
  //       this.operation = 'edit';
  //     },
  //     (error: any) => {
  //       this._spinner.hide();
  //       this.toastr.error('Erreur!', 'Erreur lors de la modification.');
  //     }
  //   );
  // }

  // GetListEntreeGratuiteById(){
  //   this.articleService.GetListEntreeGratuiteById(this.updateData.id).then(
  //     (response: any) => {
  //       console.log('xxx')
  //       this.GetListEntreeGratuite(1)
  //       this.updateData = response.data;
  //       this.newCommande = this.updateData.articles;
  //     },
  //     (error: any) => {
  //       this.toastr.error('Erreur!', error.message);
  //     }
  //   );
  // }

  // DeleteArticleCommande(data:any){
  //   this._spinner.show();
  //   this.articleService.DeleteArticleCommande(data.id).then(
  //     (response: any) => {
  //       this._spinner.hide();
  //       this.toastr.success('Succès!', response.message);
  //       this.GetListEntreeGratuiteById()
  //     },
  //     (error: any) => {
  //       this._spinner.hide();
  //       this.toastr.error('Erreur!', error.message);
  //     }
  //   );
  // }
  updateGoods(data: any) {
    this.operation = 'update';
    this.newCommande = this.updateData.articles;
    this.newCommande.forEach((item: any) => {
      this.getLocalPrice(item);
    });

    console.log(this.operation);
  }
  async GetPrixByArticle(item: any): Promise<any> {
    let data = {
      id: item.id,
    };

    try {
      // Attendre la réponse de la promesse
      const response: any = await this.articleService.GetPrixByProduit(data);
      console.log(response);
      const prixDetail = response.data.find((item: any) => {
        return this.selectedOption === 'Sous distributeur'
          ? item.libelle === 'PRIX S/DISTRIBUTEUR'
          : item.libelle === 'PRIX USINE';
      });

      console.log(prixDetail);
      // Vérifier si le statusCode est 200
      if (prixDetail.prix.length > 0) {
        this.prixLiquide[item.id] = prixDetail.prix[0].PrixLiquide;
        this.prixEmballage[item.id] = prixDetail.prix[0].PrixConsigne;
        console.log('prixByArticle', this.prixLiquide[item.id]);
      } else {
        this.toastr.error(
          "Ce article n'a pas de prix détail, veuillez le renseigner avant de continuer"
        );
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  protected readonly parseInt = parseInt;
  protected readonly Number = Number;
  protected readonly StatutCommande = StatutCommande;
  protected readonly TypeCommandeFournisseur = TypeCommandeFournisseur;
}
