import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {ALERT_INFO, ALERT_QUESTION} from '../../shared-component/utils';
import {Location} from '@angular/common';
import {StatutCommande, TypeCommandeFournisseur} from "../../../utils/utils";
import {UtilisateurResolveService} from "../../../core/utilisateur-resolve.service";
import {Op} from "quill/core";

@Component({
  selector: 'app-validation-commande',
  templateUrl: './validation-commande.component.html',
  styleUrls: ['./validation-commande.component.scss']
})
export class ValidationCommandeComponent {

  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  ArticleForm!: FormGroup
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isChoiceModalOpen: boolean
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
  ListCommandeFournisseurs: any[] = [];
  depotId: any = 0;
  totalPages: number = 0;
  prixLiquide: any = {};
  prixEmballage: any = {};
  prixLiquideTotal: any = {};
  totalLiquide: number = 0;
  totalEmballage: number = 0;
  totalGlobal: number = 0;
  totalQte: number = 0;
  prixEmballageTotal: any = {};
  montantTotal: any = {};
  filters: any = {
    numeroCommande: '',
    typeCommande: '',
    statut: '',
  };
  isModalValidOpen = false;
  ValidationForm!: FormGroup
  CommandeForm!: FormGroup
  Listfournisseurs: any[] = [];
  minDate = new Date().toISOString().split('T')[0];
  now = new Date().toISOString().split('T')[0];
  selectedArticles: any[] = [];
  newCommande: any[] = [];
  searchTerm: string = '';
  filteredArticleList: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private location: Location,
    private utilisateurService: UtilisateurResolveService
  ) {
  }

  ngOnInit() {
    this.ValidationForm = this.fb.group({
      fournisseurId: [null, Validators.required],
      dateLivraisonEstimee: [this.now, Validators.required],
    });

    this.CommandeForm = this.fb.group({
      articles: this.fb.array([]),
    });
    this.GetArticleList(1)
    this.GetFournisseursList()
    this.GetListCommandeFournisseurs(1)
  }

  filterGlobal() {
    this.GetListCommandeFournisseurs(
      1,
      this.filters.numeroCommande,
      this.filters.statut
    );
  }

  GetFournisseursList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.utilisateurService.GetFournisseursList(data).then((res: any) => {
      this.Listfournisseurs = res.data
      console.log('Listfournisseurs', res)
    }, (error: any) => {
      this._spinner.hide()
    })
  }

  GetListCommandeFournisseurs(page: number, numero?: string, statut?: string, typeCommande?: string) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      numero: numero || '',
      statut: 'Attente de Validation',
      typeCommande: 'REVENDEUR_VERS_BNS',
    };
    this._spinner.show();
    this.articleService.GetListCommandeFournisseurs(data).then((res: any) => {
      console.log('GetListCommandeFournisseurs:::>', res);
      this.totalPages = res.total;
      this.ListCommandeFournisseurs = res.data;
      this._spinner.hide();
    });
  }

  OnCloseModal() {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }

  OnCloseValidModal() {
    this.isModalValidOpen = false;
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

  saveGoods(data: any) {
    this.operation = 'edit';
    this.AjouterCommandeFournisseurs()
    console.log(this.operation);
  }

  updateGoods(data: any) {
    this.operation = 'update';
    this.newCommande = this.updateData.articles
    this.newCommande.forEach((item: any) => {
      this.getLocalPrice(item)
    })

    // this.AjouterCommandeFournisseurs()
    console.log(this.operation);
  }

  OnAddGoods(data: any, newCommande: any) {
    let item = []
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    if (data == 'edit') {
      this.operation = 'create';
    } else {
      this.operation = 'edit';
    }

  }

  OnEdit(data: any) {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
    data.articles.forEach((article: any) => {
      this.totalEmballage += Number(article.montantEmballage);
      this.totalLiquide += Number(article.montantLiquide);
      this.totalGlobal = this.totalLiquide + this.totalEmballage
      this.totalQte += article.quantite
    })
    console.log(this.isModalOpen);
  }

  AjouterCommandeFournisseurs() {
    const data = this.newCommande.map((item: any) => ({
      id: item.id,
      groupeArticleId: item.groupearticle.id,
      codeArticleLiquide: item.liquide.code,
      codeArticleEmballage: item.liquide.emballage.code,
      prixUnitaireLiquide: this.prixLiquide[item.id],
      prixUnitaireEmballage: this.prixEmballage[item.id],
      quantite: item.quantite,
    }));

    const payload = {
      articles: data
    };

    this._spinner.show();
    this.articleService.AjouterCommandeFournisseurs(this.updateData.id, payload).then(
      (response: any) => {
        this._spinner.hide();
        this.toastr.success(response.message);
        this.GetListCommandeFournisseursById()
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.error('Erreur!', 'Erreur lors de la modification.');
      }
    );
  }

  GetListCommandeFournisseursById(){
    this._spinner.show();
    this.articleService.GetListCommandeFournisseursById(this.updateData.id).then(
      (response: any) => {
        this._spinner.hide();
        this.updateData = response.data;
        this.toastr.success(response.message);
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.error('Erreur!', error.message);
      }
    );
  }
  onValidate() {
    this.isModalValidOpen = true;
  }

  onSubmit(): void {
    this._spinner.show();
    this.articleService.ValidateCommandeFournisseur(this.articleId, this.ValidationForm.value).then(
      (response: any) => {
        this.toastr.success(response.message);
        this.OnCloseModal();
        this.OnCloseValidModal()
        this.GetListCommandeFournisseurs(1);
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.error('Erreur!', 'Erreur lors de la validation.');
      }
    );

  }

  get articles(): FormArray {
    return this.CommandeForm.get('articles') as FormArray;
  }

  async getLocalPrice(item:any) {
    this.prixLiquide[item.id] = item.prixUnitaireLiquide;
    this.prixEmballage[item.id] = item.prixUnitaireEmballage;
    this.calculatePrix(item);

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
          groupeArticleId: data.groupearticle?.id || null,
          codeArticleLiquide: data.liquide?.code || '',
          codeArticleEmballage: data.liquide?.emballage?.code || data.emballage?.code || '',
          prixUnitaireLiquide: prixLiquide ?? 0,
          prixUnitaireEmballage: prixEmballage ?? 0,
          quantite: quantite ?? 0,
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

  removeArticle(item: any): void {
    // Créer une copie de l'article avec la quantité définie à 0
    const data = {
      ...item,
      quantite: 0,
      groupearticle: {id: item.groupearticle.id},
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

  onCheckboxChange(article: any): void {
    this.GetPrixByArticle(article)
    if (article.isChecked) {
      this.selectedArticles.push(article);
      this.newCommande = this.selectedArticles
    } else {
      delete article.quantite;
      const indexToRemove = this.selectedArticles.findIndex(
        (selectedArticle: any) => selectedArticle.libelle === article.libelle
      );
      if (indexToRemove !== -1) {
        this.selectedArticles.splice(indexToRemove, 1);
      }
    }
  }

  async GetPrixByArticle(item: any): Promise<any> {
    let data = {
      id: item.id,
    };

    try {
      // Attendre la réponse de la promesse
      const response: any = await this.articleService.GetPrixByProduit(data);
      console.log(response);
      const prix = response.data.find((item: any) => item.libelle === 'PRIX S/DISTRIBUTEUR');

      console.log(prix);
      // Vérifier si le statusCode est 200
      if (prix.prix.length > 0) {
        this.prixLiquide[item.id] = prix.prix[0].PrixLiquide;
        this.prixEmballage[item.id] = prix.prix[0].PrixConsigne;
        this.calculatePrix(item);
        console.log('prixByArticle', this.prixLiquide[item.id]);
      } else {
        this.toastr.error("Ce article n'a pas de prix S/DISTRIBUTEUR, veuillez le renseigner avant de continuer");
      }
    } catch (error: any) {
      console.log(error);
    }
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

  loadArticleDetails(): void {
    this.ArticleForm.patchValue({
      photo: this.updateData.photo ?? "",
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

  // Méthode pour gérer la pagination
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetListCommandeFournisseurs(this.currentPage)
  }

  goBack() {
    this.location.back()
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

  protected readonly TypeCommandeFournisseur = TypeCommandeFournisseur;
  protected readonly Number = Number;
  protected readonly StatutCommande = StatutCommande;
  protected readonly Op = Op;
}
