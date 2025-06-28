import {ChangeDetectorRef, Component} from '@angular/core';
import {ArticleServiceService} from "../../../core/article-service.service";
import {UtilisateurResolveService} from "../../../core/utilisateur-resolve.service";
import {NgxSpinnerService} from "ngx-spinner";
import {FormArray, FormBuilder} from "@angular/forms";
import {ConfigService} from "../../../core/config-service.service";
import {ToastrService} from "ngx-toastr";
import {StatutCommande} from "../../../utils/utils";
import {Location} from "@angular/common";
import {ActiviteService} from "../../../core/activite.service";

@Component({
  selector: 'app-proformat',
  templateUrl: './proformat.component.html',
  styleUrls: ['./proformat.component.scss']
})
export class ProformatComponent {
  dataList!: any[];
  currentPage: number;
  rowsPerPage: any;
  totalPages: number = 0;
  prixLiquide: any = {};
  prixEmballage: any = {};
  prixLiquideTotal: any = {};
  totalLiquide: number = 0;
  totalEmballage: number = 0;
  totalGlobal: number = 0;
  isModalOpen = false;
  totalGlobalBeforeRemise: number = 0;
  totalQte: number = 0;
  prixEmballageTotal: any = {};
  montantTotal: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  operation: string = '';
  updateData: any = {};
  filters: any = {
    numeroCommande: '',
    date: '',
    etablissement: '',
    statut: '',
  };
  constructor(
    private articleService: ArticleServiceService,
    private utilisateurService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private location: Location,
    private _config: ConfigService,
    private toastr: ToastrService,
    private _activiteService: ActiviteService,
    private cdr: ChangeDetectorRef
  ) {
  }
  ngOnInit() {
    this.GetListCommandeClient(1)
  }

  DownloadFacture(id: number) {
    this._spinner.show();
    this._activiteService.DownloadGlobalProformaById(id).then(
      (res: any) => {
        console.log('DownloadGlobalFacturesById:::>', res);
        this._spinner.hide();
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.info(error.error.message);
      }
    );
  }
  OnCloseModal() {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isModalOpen = false;
  }
  goBack() {
    this.location.back()
  }
  OnView(data: any) {
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
      this.totalGlobal = this.totalLiquide + this.totalEmballage
      this.totalQte += article.quantite
    })

    this.articleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;

    this.GetListCommandeClient(this.currentPage);
  }

  filterGlobal() {
    this.GetListCommandeClient(
      1,
      this.filters.numeroCommande,
      this.filters.date,
      this.filters.etablissement,
      this.filters.statut
    );
  }
  GetListCommandeClient(page: number, numeroCommande?: string, date?: string, etablissement?: string, statut?: string) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      numeroCommande: numeroCommande || '',
      date: date || '',
      etablissement: etablissement || '',
      statut: StatutCommande.ATTENTE_VALIDATION,
    };
    console.log('data sended:::>', data);

    this._spinner.show();
    this.articleService.GetListCommandeClient(data).then((res: any) => {
      console.log('dataList:::>', res);
      this.totalPages = res.total; // nombre total d’enregistrements
      this.dataList = res.data;
      this._spinner.hide();
    });
  }

  protected readonly Number = Number;
}
