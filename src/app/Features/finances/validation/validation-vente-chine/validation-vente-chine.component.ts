import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { FinanceService } from 'src/app/core/finance.service';
import { LogistiqueService } from 'src/app/core/logistique.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';
import {calculeDateEcheance, StatutCommande} from "../../../../utils/utils";

@Component({
  selector: 'app-validation-vente-chine',
  templateUrl: './validation-vente-chine.component.html',
  styleUrls: ['./validation-vente-chine.component.scss'],
})
export class ValidationVenteChineComponent {
  groupeProduitForm!: FormGroup;
  dataList: [];
  VenteForm: FormGroup;
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
  dataListLocalite: any;
  dataListCommercial: any;
  dataListCamion: any;
  depotId: number = 0;
  updateData: any = {};
  venteId: any = 0;
  totalPages: number;
  totalQteFree: number = 0;
  totalGlobalFree: number = 0;
  prixEmballageTotalFree: any = {};
  prixLiquideTotalFree: any = {};
  montantTotalFree:any = {};
  totalLiquideFree: number = 0;
  totalEmballageFree :number = 0;
  constructor(
    private cdr: ChangeDetectorRef,
    private _spinner: NgxSpinnerService,
    private articleService: ArticleServiceService,
    private logistiqueService: LogistiqueService,
    private coreService: CoreServiceService,
    private utilisateurService: UtilisateurResolveService,
    private _financeService: FinanceService,
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
      localiteId: [null, Validators.required],
      venteDate: [null, Validators.required],
      vehiculeId: [0, Validators.required],
      articles: this.fb.array([]),
    });

    // this.GetArticleList(1);
    this.GetCommercialList(1);
    this.GetLocaliteList(1);
    this.GetCamionList(1);
    this.GetVenteChineList(1);
  }

  OnCloseModal() {
    this.totalEmballage = 0;
    this.totalEmballageFree = 0
    this.totalLiquide = 0;
    this.totalLiquideFree = 0;
    this.totalGlobal = 0;
    this.totalGlobalFree = 0;
    this.totalQte = 0;
    this.totalQteFree = 0;
    this.isModalOpen = false;
    this.selectedArticles = [];
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


  onCheckboxChange(article: any): void {
    this.GetPrixByArticle(article);

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
      productCode: item.liquide.code,
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
    console.log('totalite', this.stocksDisponibles);
  }

  removeArticle(item: any): void {
    console.log(item);
    const data = {
      ...item,
      quantite: 0,
      groupearticle: { id: item.groupearticle.id },
      id: item.groupearticle.id, // Assurez-vous que l'ID correspond
    };

    item.isChecked = false;
    this.calculatePrix(data);
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
  DesApprouverdVente(data: any) {
    if (data) {
      ALERT_QUESTION(
        'warning',
        'Attention !',
        'Voulez-vous désapprouver cette vente?'
      ).then((res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.utilisateurService
            .DesApprouverVente(data.id)
            .then((res: any) => {
              console.log('VALIDEEEEEEEEEE:::>', res);
              this.toastr.success(res.message);
              this.OnCloseModal();
              this._spinner.hide();
              this.GetVenteChineList(1);
            });
        } else {
          this.isModalOpen = false;
        }
      });
    }
  }
  ApprouverVente(data: any) {
    if (data) {
      ALERT_QUESTION(
        'warning',
        'Attention !',
        'Voulez-vous approuver cette vente?'
      ).then((res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._financeService.ApprouverVenteChine(data.id).then((res: any) => {
            console.log('VALIDEEEEEEEEEE:::>', res);
            if(res.statusCode ==200)
            {
              this.toastr.success(res.message);
              this.GetVenteChineList(1);
              this.OnCloseModal();
            }else{
              this.toastr.error(res.message);
            }

            this._spinner.hide();

          });
        } else {
          this.isModalOpen = false;
        }
      });
    }
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
      this.dataListLiquides.forEach((item: any) => {
        this.GetStockDisponibleByDepot(item);
      });
      this.filteredArticleList = this.dataListLiquides;
      // this._spinner.hide();
    });
  }
  OnEdit(data: any) {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.totalQteFree = 0
    this.isEditMode = true;
    console.log(data, 'updateData');
    this.updateData = data;
      this.updateData.dateEchanceCalculer = calculeDateEcheance(
              data?.createdAt,
              data?.credit?.delaiReglement
            );
    this.updateData.articles.map((article: any) => {
      article.prixTotal =
        parseInt(article.prixUnitaireLiquide) +
        parseInt(article.prixUnitaireEmballage);
    });
    console.log(this.updateData.articles, 'this.updateData.articles');

    data.articles.forEach((article: any) => {
      this.totalEmballage += Number(article.montantEmballage);
      this.totalLiquide += Number(article.montantLiquide);
      this.totalGlobal = this.totalLiquide + this.totalEmballage;
      this.totalQte += article.quantite;
    });

    this.updateData.articlesGratuit.map((article: any) => {
      article.prixTotal =
        parseInt(article.prixUnitaireLiquide) +
        parseInt(article.prixUnitaireEmballage);
    });
    console.log(this.updateData.articlesGratuit, 'this.updateData.articlesGratuit');

    data.articlesGratuit.forEach((article: any) => {
      this.totalEmballageFree += Number(article.montantEmballage);
      this.totalLiquideFree += Number(article.montantLiquide);
      this.totalGlobalFree = this.totalLiquideFree + this.totalEmballageFree;
      this.totalQteFree += article.quantiteAffectee;
    });

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
    this.utilisateurService.GetVenteChineListAttente(data).then((res: any) => {
      console.log('GetVenteChineList:::>', res.data);
      this.totalPages = res.total; // nombre total d’enregistrements

      this.dataList = res.data
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
      // this._spinner.hide();
    });
  }

  GetLocaliteList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetLocaliteList(data).then((res: any) => {
      console.log('dataListLocalite:::>', res);
      this.dataListLocalite = res.data;
      // this._spinner.hide();
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
      // this._spinner.hide();
    });
  }

  validateQuantite(data: any): void {
    console.log(
      'data.quantite',
      data.quantite,
      'stocksDisponibles',
      this.stocksDisponibles[data.liquide.id]
    );
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
    return this.VenteForm.get('articles') as FormArray;
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
      const existingArticle = this.articles.at(existingArticleIndex).value;
      const oldQuantite = existingArticle.quantite || 0;
      const differenceQuantite = quantite - oldQuantite;

      // ✅ Décrémentation des anciens totaux
      this.totalEmballage -= oldQuantite * prixEmballage;
      console.log(this.totalEmballage, oldQuantite, '*', prixEmballage);
      this.totalLiquide -= oldQuantite * prixLiquide;
      console.log(this.totalLiquide, oldQuantite, '*', prixLiquide);
      this.totalQte -= oldQuantite;
      console.log(this.totalQte);

      // ✅ Suppression si la quantité est 0
      if (quantite === 0) {
        console.log('off');
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
    // this.cdr.detectChanges();
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

  protected readonly Number = Number;
}
