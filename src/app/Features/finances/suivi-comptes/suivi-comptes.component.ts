import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import {UtilisateurResolveService} from "../../../core/utilisateur-resolve.service";

@Component({
  selector: 'app-suivi-comptes',
  templateUrl: './suivi-comptes.component.html',
  styleUrls: ['./suivi-comptes.component.scss']
})
export class SuiviComptesComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  dataClient: any[] = [];
  CreditForm!: FormGroup;
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
  dataRevendeur: any[] = [];
  dataPointDeVente: any[] = [];
  dataListArticlesProduits: any = [];
  currentPage: number;
  rowsPerPage: any;
  constructor(
    private articleService: ArticleServiceService,
    private utilisateurService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.CreditForm = this.fb.group({
      revendeurId: [null, Validators.required],
      creditLiquide: [null, Validators.required],
      creditEmballage: [null, Validators.required],
      creditTotal: [null]
    });
this.CreditForm.controls['creditTotal'].disable();
    this.fetchData()
    this.GetArticleList(1);
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
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    // this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetArticleList(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetArticleList(this.currentPage);
  }
  onSubmit(): void {

    console.log(this.CreditForm.value);
    if (this.CreditForm.valid) {
      // const formValues = this.ArticleForm.value;
      this._spinner.show();
      console.log('this.isEditMode', this.isEditMode);

      if (this.isEditMode) {
        // this.articleService.UpdateArticle(this.articleId, formValues).then(
        //   (response: any) => {
        //     console.log('article mis à jour avec succès', response);
        //     this._spinner.hide();
        //     this.OnCloseModal();
        //     this.GetArticleList(1);
        //     this.toastr.success(response.message);
        //   },
        //   (error: any) => {
        //     this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
        //     console.error('Erreur lors de la mise à jour', error);
        //   }
        // );
      } else {
        this.articleService.CreateArticle(this.CreditForm.value).then(
          (response: any) => {
            this.OnCloseModal();
            this._spinner.hide();
            // this.GetArticleList(1);
            this.CreditForm.reset();
            this.toastr.success(response.message);

            console.log('Crédit créé avec succès', response);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  // loadArticleDetails(): void {
  //   this.ArticleForm.patchValue({
  //     photo: this.updateData.photo ?? '',
  //     libelle: this.updateData.libelle,
  //     format: this.updateData.format,
  //     Conditionnement: this.updateData.Conditionnement,
  //     categorieId: this.updateData.categorieproduit.id,
  //     groupeId: this.updateData.groupearticle.id,
  //     plastiquenuId: this.updateData.plastiquenu.id,
  //     bouteillevideId: this.updateData.bouteillevide.id,
  //     liquideId: 1,
  //   });
  // }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
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
        this.articleService.GetListRevendeur(data),  // Remplacez par votre méthode API
        this.utilisateurService.GetCommercialList(data),
      ]);

      console.log("Données revendeur:", revendeur);
      console.log("Données pointDeVente:", pointDeVente);
      // Vérifier si plastiques et liquides sont bien des tableaux
      if (Array.isArray(revendeur.data)) {
        this.dataRevendeur = revendeur.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataClient.push(...revendeur.data);
      } else {
        console.error("Les données de plastiques ne sont pas un tableau");
      }

      if (Array.isArray(pointDeVente.data)) {
        this.dataPointDeVente = pointDeVente.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataClient.push(...pointDeVente.data);
      } else {
        console.error("Les données de liquides ne sont pas un tableau");
      }
      this.dataClient = this.dataClient.map(client => ({
        ...client,
        displayName: client.raisonSocial || client.nom+' '+client.prenom || 'N/A'
      }));
      console.log('Données combinées dans dataList:', this.dataClient);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération des données:', error);
    }
  }
}
