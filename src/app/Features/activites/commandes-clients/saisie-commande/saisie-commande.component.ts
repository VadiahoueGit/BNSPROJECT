import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';

@Component({
  selector: 'app-saisie-commande',
  templateUrl: './saisie-commande.component.html',
  styleUrls: ['./saisie-commande.component.scss']
})
export class SaisieCommandeComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  commandClientForm!:FormGroup
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  totalLiquide: string = '';
  totalEmballage: string = '';
  totalGlobal: string = '';
  totalQuantite: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any= [];
  dataListGroupeArticles: any =[];
  dataListBouteilleVide: any=[];
  dataListPlastiqueNu: any=[];
  items: any=[];
  articles = [
    { id: 1, libelle: 'Article A', liquide: 500, emballage: 200, total: 700 },
    { id: 2, libelle: 'Article B', liquide: 800, emballage: 300, total: 1100 },
    { id: 3, libelle: 'Article C', liquide: 400, emballage: 100, total: 500 },
  ];
  selectedArticle: any=[];
  clients: any=[];
  currentPage: number;
  rowsPerPage: any;
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.commandClientForm = this.fb.group({
      numeroCompte: ['', Validators.required],
      raisonSociale: ['', Validators.required],
      montantCredit: ['', Validators.required],
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

    this.articleService.GetFormatList().then((res: any) => {
      this.dataListFormats = res;
      console.log('dataListFormats:::>', this.dataListFormats);
    });

    this.articleService.GetConditionnementList().then((res: any) => {
      this.dataListConditionnements = res;
      console.log('dataListConditionnements:::>', this.dataListConditionnements);
    });
    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res;
      console.log(this.dataListProduits, 'this.dataListProduits ');
    });
    this.articleService.ListGroupesArticles.subscribe((res: any) => {
      this.dataListGroupeArticles = res;
    });
     this.GetArticleList(1);
  }
  onDelete(item:any){
console.log(item)
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
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    this.commandClientForm.reset();
    console.log(this.isModalOpen);
  }

  OnEdit(data:any) {
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
      this.dataList = [];
      this._spinner.hide();
    });
  }
  onArticleChange(articleId: number): void {
    this.selectedArticle = this.articles.find(article => article.id === articleId);
  }
  onSubmit(): void {
    console.log(this.commandClientForm.value);
    if (this.commandClientForm.valid) {
      // const formValues = this.commandClientForm.value;
      const formValues = {
        ...this.commandClientForm.value,
        categorieId: +this.commandClientForm.value.categorieId,
        groupeId: +this.commandClientForm.value.groupeId,
        plastiquenuId: +this.commandClientForm.value.plastiquenuId,
        bouteillevideId: +this.commandClientForm.value.bouteillevideId,
        liquideId: +this.commandClientForm.value.liquideId,
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this.articleService.UpdateArticle(this.articleId, formValues).then(
          (response: any) => {
            console.log('article mis à jour avec succès', response);
            this.toastr.success('Succès!', 'Article mis à jour avec succès.');
            this.OnCloseModal();
            this.GetArticleList(1);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.articleService.CreateArticle(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetArticleList(1);
            this.commandClientForm.reset();
            this.toastr.success('Succès!', 'Article créé avec succès.');
            console.log('Nouvel article créé avec succès', response);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  onSearchClient(): void {
  }
  loadArticleDetails(): void {
    this.commandClientForm.patchValue({
      photo: this.updateData.photo??"",
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
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res:any) => {
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


