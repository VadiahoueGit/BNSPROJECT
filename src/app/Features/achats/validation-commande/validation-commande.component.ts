import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {ALERT_INFO, ALERT_QUESTION} from '../../shared-component/utils';
import {Location} from '@angular/common';
import {StatutCommande, TypeCommandeFournisseur} from "../../../utils/utils";
import {UtilisateurResolveService} from "../../../core/utilisateur-resolve.service";

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
  Listfournisseurs: any[] = [];
  minDate = new Date().toISOString().split('T')[0];
  now = new Date().toISOString().split('T')[0];

  constructor(
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

  GetArticleList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      // this.dataList = res.data;
      this.dataList = [];
      this._spinner.hide();
    });
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
}
