import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';
import {UtilisateurResolveService} from "../../../../core/utilisateur-resolve.service";

@Component({
  selector: 'app-saisie-commande-gratuite',
  templateUrl: './saisie-commande-gratuite.component.html',
  styleUrls: ['./saisie-commande-gratuite.component.scss']
})
export class SaisieCommandeGratuiteComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList : any[] = [];
  selectedArticles: any[] = [];
  totalPages: number = 0;
  pointDeVente!: any[];
  CommandeForm!:FormGroup
  isChoiceModalOpen: boolean
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  searchTerm: string = '';
  filteredArticleList: any[] = [];
  dataListLiquides: any=[];
  dataListPlastiqueNu: any=[];
  dataListEmballage: any=[];
  dataListArticlesProduits: any=[];
  currentPage: number;
  rowsPerPage: any;
  stocksDisponibles: any = {};
  prixLiquide: any = {};
  prixEmballage: any = {};
  prixLiquideTotal: any = {};
  totalLiquide:number = 0;
  totalEmballage:number = 0;
  totalGlobal:number = 0;
  totalQte:number = 0;
  prixEmballageTotal: any = {};
  montantTotal: any = {};
  selectedOption: string = 'gratuitClient';
  listRevendeurs: any[] = [];
  dataRevendeur: any[] = [];
  dataPointDeVente: any[] = [];
  ListCommandeGratuites: any[] = [];
  depotId: any = 0;
   filters :any  = {
    numeroCommande: '',
    date: '',
    etablissement: '',
     statut: ''
  };
  constructor(
    private cdr: ChangeDetectorRef,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private utilisateurService:UtilisateurResolveService
  ) {}

  ngOnInit() {
    this.CommandeForm = this.fb.group({
      clientId: [null, Validators.required],
      clientType: [null, Validators.required],
      depotId: [null, Validators.required],
      articles: this.fb.array([]),
    });
    this.GetArticleList(1)
    // this.LoadPdv()
    // this.GetRevendeurList(1)
    this.GetListCommandeGratuite(1)
    this.fetchData()
  }
  GetRevendeurList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetListRevendeur(data).then((res: any) => {
      console.log('GetListRevendeur:::>', res);
      this.listRevendeurs = res.data;
      this._spinner.hide();
    });
  }
  GetArticleList(page:number) {
    let data = {
      paginate: false,
      page:page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListLiquides = res.data;
      this.dataListLiquides.forEach((item: any) => {
        this.GetStockDisponibleByDepot(item)
      })
      this.filteredArticleList = this.dataListLiquides;
      this._spinner.hide();
    });
  }
  filterGlobal() {
    this.GetListCommandeGratuite(
      1,
      this.filters.numeroCommande,
      this.filters.date,
      this.filters.etablissement
    );
  }
  GetListCommandeGratuite(page:number,numeroCommande?:string,date?:string,etablissement?:string,statut?:string) {
    let data = {
      paginate: false,
      page:page,
      limit: 8,
      numeroCommande: numeroCommande || '',
      date:date || '',
      etablissement: etablissement || '',
      statut: statut || '',
    };
      console.log('data sended:::>', data);

    this._spinner.show();
    this.articleService.GetListCommandeGratuite(data).then((res: any) => {
      console.log('ListCommandeGratuites:::>', res);
      this.totalPages = res.totalPages; // nombre total d’enregistrements
      this.ListCommandeGratuites = res.data;
      this._spinner.hide();
    });
  }
  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  OnCloseModal() {
    this.totalEmballage = 0;
    this.totalLiquide  = 0;
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
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data:any) {
    this.totalEmballage = 0;
    this.totalLiquide  = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    data.articles.forEach((article:any) => {
      this.totalEmballage += Number(article.montantEmballage);
      this.totalLiquide  += Number(article.montantLiquide);
      this.totalGlobal = this.totalLiquide + this.totalEmballage
      this.totalQte += article.quantite
    })

    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  onSubmit(): void {
    this.CommandeForm.controls['depotId'].setValue(this.depotId);
    console.log(this.CommandeForm.value);
    if (this.CommandeForm.valid) {
      this._spinner.show()
      this.articleService.CreateCommandGratuite(this.CommandeForm.value).then((res: any) => {
        console.log(res,'enregistré avec succes')
        this._spinner.hide();
        if(res.statusCode === 201) {
          this.CommandeForm.reset();
          this.GetListCommandeGratuite(1)
          this.OnCloseModal()
          this.toastr.success(res.message);
        }else{
          this.toastr.error(res.message);
        }
      }, (error: any) => {
          this._spinner.hide();
          this.toastr.info(error.error.message);
          console.error('Erreur lors de la création', error);
      })
    }else{
      this.toastr.warning('Formulaire invalide');
    }

  }
  LoadPdv() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.utilisateurService.GetPointDeVenteList(data).then((res: any) => {
      this.pointDeVente = res.data
      console.log('pointDeVente', res)
    }, (error: any) => {
      this._spinner.hide()
    })
  }
  onCheckboxChange(article: any): void {
    this.GetPrixByArticle(article)
    if (article.isChecked) {
      this.selectedArticles.push(article);
      this.afficherArticlesSelectionnes()
    } else {
      delete article.quantite;
      const indexToRemove = this.selectedArticles.findIndex(
        (selectedArticle:any) => selectedArticle.libelle === article.libelle
      );
      if (indexToRemove !== -1) {
        this.selectedArticles.splice(indexToRemove, 1);
        this.afficherArticlesSelectionnes()
      }
    }
  }
  removeArticle(item: any): void {
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
      this.selectedArticles = this.selectedArticles.slice(0, index).concat(this.selectedArticles.slice(index + 1));
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
    console.log(this.searchTerm)
    if (this.searchTerm) {
      this.filteredArticleList = this.dataListLiquides.filter((article: any) =>
        article.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        article.reference.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      console.log(this.filteredArticleList)
    } else {
      this.filteredArticleList = [...this.dataListLiquides];
    }
  }
  OnCloseChoiceModal() {
    this.deselectAllItems()
    this.isChoiceModalOpen = false;
    console.log(this.isModalOpen)
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

    this.GetListCommandeGratuite(this.currentPage);
  }

  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res:any) => {
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
  onRevendeurChange(selectedItem: any): void {
    console.log('Élément sélectionné :', selectedItem);
    this.depotId = selectedItem.depot.id;
    this.CommandeForm.controls["clientType"].setValue(selectedItem.role);
    this.GetArticleList(1)
  }
  async GetStockDisponibleByDepot(item: any): Promise<any> {
    let data = {
      productCode: item.liquide.code,
      depotId:this.depotId
    };

    try {
      // Attendre la réponse de la promesse
      const response:any = await this.articleService.GetStockDisponibleByDepot(data);
      console.log(response)
      // Vérifier si le statusCode est 200
      if (response) {
        this.stocksDisponibles[item.liquide.id] = response.quantiteDisponible;
      } else if (response.statusCode === 404) {
        this.stocksDisponibles[item.liquide.id] =  0; // Si le code est 404, retourner 0
      } else {
        return null; // Si un autre code, retourner null ou une valeur par défaut
      }
    } catch (error:any) {
      console.log(error);
      if (error.status === 404) {
        this.stocksDisponibles[item.liquide.id] = 0; // Si le code est 404, retourner 0
      }
    }

    console.log('totalite',this.stocksDisponibles);
  }
  validateQuantite(data: any): void {
    // Vérifier si la quantité saisie dépasse la quantité disponible
    if (data.quantite > this.stocksDisponibles[data.liquide.id]) {
      // Réinitialiser la quantité à la quantité disponible
      data.quantite ='';
      // Afficher un message de warning
      this.toastr.warning('La quantité saisie dépasse la quantité disponible.');
    }else{
      this.calculatePrix(data)
    }
  }
  get articles(): FormArray {
    return this.CommandeForm.get('articles') as FormArray;
  }

  calculatePrix(data: any) {
    console.log('DATA:::>', data);

    const prixLiquide =  0;
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
          codeArticleEmballage: data.liquide.emballage.code,
          prixUnitaireLiquide: prixLiquide,
          prixUnitaireEmballage: prixEmballage,
          quantite: quantite,
        })
      );
    }

    // ✅ Recalcul des montants
    this.montantTotal[data.id] = (this.prixLiquideTotal[data.id] || 0) + (this.prixEmballageTotal[data.id] || 0);

    // ✅ Mise à jour des totaux globaux
    this.totalEmballage = this.articles.controls.reduce((acc, control) => acc + (control.value.prixUnitaireEmballage * control.value.quantite), 0);
    this.totalLiquide = this.articles.controls.reduce((acc, control) => acc + (control.value.prixUnitaireLiquide * control.value.quantite), 0);
    this.totalQte = this.articles.controls.reduce((acc, control) => acc + control.value.quantite, 0);
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

  async fetchData() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
      proprietaire: '',
      groupeClient:'',
      raisonSociale: '',
    };

    let data_ = {
      paginate: false,
      page: 1,
      limit: 8,
      depot: '',
      etablissement: '',
      statut: '',
    };
    try {
      // Effectuer les deux appels API en parallèle
      const [revendeur, pointDeVente]: [any, any] = await Promise.all([
        this.articleService.GetListRevendeur(data), // Remplacez par votre méthode API
        this.utilisateurService.GetPointDeVenteList(data_),
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

      if (Array.isArray(pointDeVente.data)) {
        this.dataPointDeVente = pointDeVente.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.listRevendeurs.push(...pointDeVente.data);
      } else {
        console.error('Les données de liquides ne sont pas un tableau');
      }

      this.listRevendeurs = this.listRevendeurs
        .filter((client:any) => client.credit != null)
        .map((client:any) => ({
          ...client,
          displayName:
            client.raisonSocial || client.nomEtablissement || 'N/A',
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
  async GetPrixByArticle(item: any): Promise<any> {
    let data = {
      id: item.id,
    };

    try {
      // Attendre la réponse de la promesse
      const response:any = await this.articleService.GetPrixByProduit(data);
      const prixDetail = response.data.find((item: any) => item.libelle === 'PRIX DETAIL');

      console.log(prixDetail);
      // Vérifier si le statusCode est 200
      if (prixDetail.prix.length > 0) {
        this.prixLiquide[item.id] = prixDetail.prix[0].PrixLiquide;
        this.prixEmballage[item.id] = prixDetail.prix[0].PrixConsigne;
        console.log('prixByArticle', this.prixLiquide[item.id]);
      }else {
        this.toastr.error("Ce article n'a pas de prix détail, veuillez le renseigner avant de continuer");
      }
    } catch (error:any) {
      console.log(error);
    }
  }

  protected readonly parseInt = parseInt;
  protected readonly Number = Number;
}
