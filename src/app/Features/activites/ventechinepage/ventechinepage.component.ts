import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {ArticleServiceService} from "../../../core/article-service.service";

@Component({
  selector: 'app-ventechinepage',
  templateUrl: './ventechinepage.component.html',
  styleUrls: ['./ventechinepage.component.scss']
})
export class VentechinepageComponent {
  groupeProduitForm!: FormGroup
  dataList: []
  VenteForm: FormGroup
  loading: boolean = true;
  isModalOpen = false;
  isChoiceModalOpen: boolean
  isEditMode: boolean
  operation: string = ''
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

  constructor(private _spinner: NgxSpinnerService,
              private articleService: ArticleServiceService,
              private toastr: ToastrService,
              private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.groupeProduitForm = this.fb.group({
      libelle: ['', Validators.required],
      code: ['', Validators.required],
    });
    this.VenteForm = this.fb.group({
      commercial: [null, Validators.required],
      zone: [null, Validators.required],
      date: [null, Validators.required],
      camion: [0, Validators.required],
      produit: [0, Validators.required],
      quantite: [0, Validators.required],
    });

    this.GetArticleList(1)
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen)
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
    console.log(this.isModalOpen)
  }

  onSubmit() {
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
        (selectedArticle: any) => selectedArticle.libelle === article.libelle
      );
      if (indexToRemove !== -1) {
        this.selectedArticles.splice(indexToRemove, 1);
        this.afficherArticlesSelectionnes()
      }
    }
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

  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }

  filterArticles(): void {
    console.log(this.searchTerm);
    if (this.searchTerm) {
      this.filteredArticleList = this.dataListLiquides.filter((article: any) => {
        console.log('dataListLiquides', article);

        const libelle = article?.libelle || ''; // Utiliser une valeur par défaut si libelle est undefined
        const code = article?.code || '';       // Utiliser une valeur par défaut si code est undefined

        // Vérification sécurisée avant d'utiliser toLowerCase()
        return (
          libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          code.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      });

      console.log(this.filteredArticleList);
    } else {
      this.filteredArticleList = [...this.dataListLiquides];
    }
  }


  OnCloseChoiceModal() {
    this.deselectAllItems()
    this.isChoiceModalOpen = false;
    console.log(this.isModalOpen)
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    // this.GetArticleList(this.currentPage);
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
  async GetPrixByArticle(item: any): Promise<any> {
    let data = {
      id: item.id,
    };

    try {
      // Attendre la réponse de la promesse
      const response: any = await this.articleService.GetPrixByProduit(data);
      console.log(response)
      // Vérifier si le statusCode est 200
      if (response.data) {
        this.prixLiquide[item.id] = response.data.PrixLiquide;
        this.prixEmballage[item.id] = response.data.PrixConsigne;
        console.log('prixByArticle', this.prixLiquide[item.id])
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
