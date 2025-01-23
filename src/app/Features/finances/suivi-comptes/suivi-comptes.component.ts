import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { UtilisateurResolveService } from '../../../core/utilisateur-resolve.service';
import { FinanceService } from 'src/app/core/finance.service';

@Component({
  selector: 'app-suivi-comptes',
  templateUrl: './suivi-comptes.component.html',
  styleUrls: ['./suivi-comptes.component.scss'],
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
  creditId: any = 0;
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
    private _financeService: FinanceService,
    private _articleService: ArticleServiceService,
    private utilisateurService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.CreditForm = this.fb.group({
      clientType: [null],
      clientId: [null, Validators.required],
      creditLiquide: [null, Validators.required],
      creditEmballage: [null, Validators.required],
      totalCredit: [{ value: 0,  }],
    });
    this.CreditForm.controls['totalCredit'].disable();
    this.onChanges();
    this.fetchData();
    this.GetCreditList(1);
  }
  onChanges(): void {
    this.CreditForm.get('creditLiquide')?.valueChanges.subscribe(() => this.updateTotal());
    this.CreditForm.get('creditEmballage')?.valueChanges.subscribe(() => this.updateTotal());
  }
  updateTotal(): void {
    const creditLiquide = this.CreditForm.get('creditLiquide')?.value || 0;
    const creditEmballage = this.CreditForm.get('creditEmballage')?.value || 0;
    const total = creditLiquide + creditEmballage;

    this.CreditForm.get('totalCredit')?.setValue(total, { emitEvent: false }); 

    const updatedtotalCredit = this.CreditForm.get('totalCredit')?.value;
    console.log(updatedtotalCredit, 'totalCredit');

  }
  OnclientChange(client: any){
    const selectedClient = this.dataClient.find(x => x.id === client.id);
    if (selectedClient) {
      this.CreditForm.patchValue({
        clientType: selectedClient.role,
      });
    }
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
    this.creditId = data.id;
    this.isModalOpen = true;
    this.loadUpdateData()
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetCreditList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._financeService.GetCreditList(data).then((res: any) => {
      console.log('GetCreditList:::>', res);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetCreditList(this.currentPage);
  }
  onSubmit(): void {
    this.CreditForm.get('totalCredit')?.enable(); 
    console.log(this.CreditForm.value);
    if (this.CreditForm.valid) {
      const formValues = this.CreditForm.value;
      this._spinner.show();
      console.log('this.isEditMode', this.isEditMode);

      if (this.isEditMode) {
      
        this._financeService.UpdateCredit(this.creditId, formValues).then(
          (response: any) => {
            console.log('article mis à jour avec succès', response);
            this._spinner.hide();
            this.OnCloseModal();
            this.GetCreditList(1);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        console.log(this.CreditForm.value, 'credit form');

        this._financeService.CreateCredit(this.CreditForm.value).then(
          (response: any) => {
            this.OnCloseModal();
            this._spinner.hide();
            this.GetCreditList(1);
            this.CreditForm.reset();
            this.toastr.success(response.message);

            console.log('Crédit créé avec succès', response);
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  loadUpdateData(): void {
    this.CreditForm.patchValue({
      clientId: this.updateData.clientId ,
      clientType: this.updateData.clientType,
      creditEmballage: this.updateData.creditEmballage,
      creditLiquide: this.updateData.creditLiquide,
      totalCredit: this.updateData.totalCredit,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._financeService.DeleteCredit(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetCreditList(1);
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
        this._articleService.GetListRevendeur(data), // Remplacez par votre méthode API
        this.utilisateurService.GetCommercialList(data),
      ]);

      console.log('Données revendeur:', revendeur);
      console.log('Données pointDeVente:', pointDeVente);
      // Vérifier si plastiques et liquides sont bien des tableaux
      if (Array.isArray(revendeur.data)) {
        this.dataRevendeur = revendeur.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataClient.push(...revendeur.data);
      } else {
        console.error('Les données de plastiques ne sont pas un tableau');
      }

      if (Array.isArray(pointDeVente.data)) {
        this.dataPointDeVente = pointDeVente.data;
        // Utilisation de l'opérateur de décomposition uniquement si c'est un tableau
        this.dataClient.push(...pointDeVente.data);
      } else {
        console.error('Les données de liquides ne sont pas un tableau');
      }
      this.dataClient = this.dataClient.map((client) => ({
        ...client,
        displayName:
          client.raisonSocial || client.nom + ' ' + client.prenom || 'N/A',
      }));
      console.log('Données combinées dans dataList:', this.dataClient);
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération des données:', error);
    }
  }
}
