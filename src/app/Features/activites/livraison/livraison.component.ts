import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';

@Component({
  selector: 'app-livraison',
  templateUrl: './livraison.component.html',
  styleUrls: ['./livraison.component.scss']
})
export class LivraisonComponent {
 @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  livraisonForm!: FormGroup;
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
  items: any = [];
  filteredArticleList: any[] = [];

  articles = [
    { id: 1, libelle: 'Article A', liquide: 500, emballage: 200, total: 700 },
    { id: 2, libelle: 'Article B', liquide: 800, emballage: 300, total: 1100 },
    { id: 3, libelle: 'Article C', liquide: 400, emballage: 100, total: 500 },
  ];
  selectedArticle: any = [];
  dataListLiquides: any = [];
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
  clients: any = [];
  currentPage: number;
  rowsPerPage: any;
  listRevendeurs: any[] = [];
  constructor(
    private articleService: ArticleServiceService,
    private _userSerive: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private location: Location,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.livraisonForm = this.fb.group({
      clientId: [null, Validators.required],
      numeroCompte: ['', Validators.required],
      raisonSociale: ['', Validators.required],
      montantCredit: ['', Validators.required],
      enCours: ['', Validators.required],
      soldeEmballage: ['', Validators.required],
      numSap: ['', Validators.required],
      remise: ['', Validators.required],
      contact: ['', Validators.required],
      soldeLiquide: ['', Validators.required],
      statutCompte: ['DÉSACTIVÉ', Validators.required],
      numeroCommande: ['', Validators.required],
      referenceArticle: ['', Validators.required],
      quantite: [0, [Validators.required, Validators.min(1)]],
      fraisTransport: [0, Validators.required],
    });

    // Par défaut, aucun article n'est sélectionné
    this.selectedArticle = this.articles[0];
    this.articleService.ListPlastiquesNu.subscribe((res: any) => {
      this.dataListPlastiqueNu = res;
    });
    // this.articleService.ListLiquides.subscribe((res: any) => {
    //   this.dataListLiquides = res;
    // });
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
    this.GetArticleList(1);
    this.GetRevendeurList(1);
  }
  onDelete(item: any) {
    console.log(item);
  }
  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }
  goBack() {
    this.location.back()
  }
  clear(table: Table) {
    table.clear();
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    this.livraisonForm.reset();
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
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
      this.filteredArticleList = this.dataListLiquides;
      this._spinner.hide();
    });
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
  onArticleChange(articleId: number): void {
    this.selectedArticle = this.articles.find(
      (article) => article.id === articleId
    );
  }
  onSubmit(): void {
    
  }
  selectArticle() {
    this.isEditMode = false;
    this.isChoiceModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }
  validateQuantite(data: any): void {

    // Vérifier si la quantité saisie dépasse la quantité disponible
    if (data.quantite > this.stocksDisponibles[data.id]) {
      // Réinitialiser la quantité à la quantité disponible
      data.quantite ='';
      // Afficher un message de warning
      this.toastr.warning('La quantité saisie dépasse la quantité disponible.');
    }else{
      this.calculatePrix(data)
    }
  }
  calculatePrix(data:any) {


    if (this.prixLiquideTotal[data.id]) {
      this.totalEmballage -= this.prixEmballageTotal[data.id] || 0;
      this.totalLiquide -= this.prixLiquideTotal[data.id] || 0;
      this.totalGlobal -= this.montantTotal[data.id] || 0;
      this.totalQte -= data.oldQuantite || 0
    }
    this.prixLiquideTotal[data.id] = data.quantite * this.prixLiquide[data.id];
    this.prixEmballageTotal[data.id] = data.quantite * this.prixEmballage[data.id];
    this.montantTotal[data.id] = this.prixLiquideTotal[data.id] + this.prixEmballageTotal[data.id];

    this.totalEmballage += this.prixEmballageTotal[data.id];
    this.totalLiquide  += this.prixLiquideTotal[data.id];
    this.totalGlobal += this.montantTotal[data.id];
    this.totalQte += data.quantite

    data.oldQuantite = data.quantite;
    console.log(data);
    console.log(this.totalQte,'totalQte');
    console.log(this.totalLiquide,"totalLiquide");
    console.log(this.totalEmballage,"totalEmballage");
    console.log(this.totalGlobal),"totalGlobal";
  }
  onCheckboxChange(article: any): void {
    this.GetPrixByArticle(article)
    // this.GetStockDisponibleByDepot(article)
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
  async GetPrixByArticle(item: any): Promise<any> {
    let data = {
      id: item.id,
    };

    try {
      // Attendre la réponse de la promesse
      const response:any = await this.articleService.GetPrixByProduit(data);
      console.log(response)
      // Vérifier si le statusCode est 200
      if (response.data) {
        this.prixLiquide[item.id] = response.data.PrixLiquide;
        this.prixEmballage[item.id] = response.data.PrixConsigne;
        console.log('prixByArticle',this.prixLiquide[item.id])
      }
    } catch (error:any) {
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
      this.selectedArticles = this.selectedArticles.slice(0, index).concat(this.selectedArticles.slice(index + 1));
    }

  }
  onSubmitSelection() {
    this.isChoiceModalOpen = false;
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
  // onSearchClient(): void {}
  loadArticleDetails(): void {
    this.livraisonForm.patchValue({
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
  onChange(event: any): void {
    this.detailPointDevente = event;
    console.log(this.detailPointDevente,'detailPointDevente')
  }
  filterArticles(): void {
    console.log(this.searchTerm)
    if (this.searchTerm) {
      this.filteredArticleList = this.dataListLiquides.filter((article: any) =>
        article.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        article.code.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      console.log(this.filteredArticleList)
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
}
