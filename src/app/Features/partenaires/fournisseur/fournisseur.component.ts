import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-fournisseur',
  templateUrl: './fournisseur.component.html',
  styleUrls: ['./fournisseur.component.scss'],
})
export class FournisseurComponent {
  dataList: any[] = [];
  selectedRevendeur: any;
  isActive: boolean = false;
  revendeurConfirmed: any[] = [];
  produits: any[] = [];
  depots: any[] = [];
  zoneLivraison: any[] = [];
  localites: any[] = [];
  categories: any[] = [];
  clientTypes: any[] = [];
  ListGroupesArticles: any[] = [];
  currentPage: number;
  updateData: any = {};
  rowsPerPage: any;
  id: any = 0;
  fournisseurForm!: FormGroup;
  operation: string = '';
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  imageUrl: any;
  docUrl: any;
  isModalDetail: boolean = false;
  RevendeurDetail: any;
  selectedRccmFile: File | null = null;
  selectedCniFile: File | null = null;
  selectedDfeFile: File | null = null;
  numeroSap: any;
  filteredCount: number = 0;
  @ViewChild('dt2') dt2!: Table;
  totalPages: number;
  Listfournisseurs: any;
  CurrencyList: any;
  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private location: Location,
    private coreService: CoreServiceService,
    private _articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private utilisateurService: UtilisateurResolveService,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.fournisseurForm = this.fb.group({
      // codeFss: [''],
      nom: ['', Validators.required],
      codeGroupe: ['', Validators.required],
      adresse: ['', Validators.required],
      pays: ['', Validators.required],
      deviseId: [null, Validators.required],
      telephone1: ['',Validators.required],
      telephone2: ['',Validators.required],
      siteWeb: ['',],
    });
    this.GetFournisseursList(1);
    this.GetCurrencyList(1)
  }

  goBack() {
    this.location.back();
  }
  updateFilteredCount(table: any) {
    this.filteredCount = table.filteredValue
      ? table.filteredValue.length
      : this.dataList.length;
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetFournisseursList(this.currentPage);
  }
  OnCreate() {
    this.fournisseurForm.enable();
    this.isModalOpen = true;
    this.operation = 'create';
    this.isEditMode = false;
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.id = data.id;
    this.isModalOpen = true;
    this.loadClientDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  preloadData(event: any): void {
    this.selectedRevendeur = event;
    this.fournisseurForm.patchValue({
      groupeClientId: event.groupeClient.id,
      numeroRegistre: event.numeroRegistre,
      contact: event.contact,
      telephone: event.telephone,
      nomProprietaire: event.nomProprietaire,
      telephoneProprietaire: event.telephoneProprietaire,
      quantiteMinimumACommander: event.quantiteMinimumACommander,
      numeroCompteContribuable: event.numeroCompteContribuable,
      familleProduitId: event.familleProduitId,
    });
    console.log(this.fournisseurForm.value);
  }

  loadClientDetails(): void {
    this.fournisseurForm.patchValue({
      codeGroupe: this.updateData.codeGroupe,
      nom: this.updateData.nom,
      telephone1: this.updateData.telephone1,
      telephone2: this.updateData.telephone2,
      pays: this.updateData.pays,
      adresse: this.updateData.adresse,
      siteWeb: this.updateData.siteWeb,
      deviseId: this.updateData.devise.id,
    });
  }

  OnValidate(data: any) {
    if (!data.isValide) {
      console.log(data, 'client Osr details');
      this.isModalDetail = true;
      this.RevendeurDetail = data;

      if (this.docUrl && data?.photo) {
        this.imageUrl = `${this.docUrl.replace(/\/$/, '')}/${data.photo.replace(
          /^\//,
          ''
        )}`;
      } else {
        console.log('docUrl ou data.photo est null ou undefined.');
        this.imageUrl = '';
      }

      console.log(this.imageUrl, 'imageUrl');
    } else {
      this.toastr.warning('Ce revendeur a déja été validé');
    }
  }

  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || ''; // Utilisez une valeur par défaut
    this.dt2.filterGlobal(value, 'contains');
  }
  OnCloseDetailModal() {
    this.isModalDetail = false;
    this.numeroSap = '';
    console.log(this.isModalOpen);
  }
  selectedFile: File | null = null;
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  confirmValidateOperation(revendeur: any) {
    if (!revendeur.isValide) {
      ALERT_QUESTION(
        'warning',
        'Attention !',
        'Voulez-vous valider ce revendeur?'
      ).then((res) => {
        if (res.isConfirmed) {
          this._spinner.show();

          const formData = new FormData();

          formData.append('cni', this.selectedCniFile!);
          formData.append('registre', this.selectedRccmFile!);
          formData.append('dfe', this.selectedDfeFile!);
          formData.append('numeroSAP', this.numeroSap);

          this._articleService.ValidateRevendeur(revendeur.id, formData).then(
            (response: any) => {
              console.log('VALIDEEEEEEEEEE:::>', response);
              this.toastr.success(response.message);
              this.OnCloseDetailModal();
              this._spinner.hide();
              this.GetFournisseursList(1);
            },
            (error: any) => {
              this._spinner.hide();
              this.toastr.error('Erreur!', 'Erreur lors de la validation.');
              console.error('Erreur lors de la validation', error);
            }
          );
        } else {
          this.isModalDetail = false;
        }
      });
    }
  }

  
  OnCloseModal() {
    this.isModalOpen = false;
    this.fournisseurForm.reset();
  }
  activateField(data: boolean) {
    this.isActive = data;
    if (!this.isActive) {
      this.fournisseurForm.reset();
      this.selectedRevendeur = null;
    }
  }

  GetFournisseursList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this.utilisateurService.GetFournisseursList(data).then(
      (res: any) => {
        this.dataList = res.data;
        console.log('Listfournisseurs', res);
        this.filteredCount = this.dataList.length;
      },
      (error: any) => {
        this._spinner.hide();
      }
    );
  }
  GetCurrencyList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this.coreService.GetCurrencyList(data).then(
      (res: any) => {
        this.CurrencyList = res.data;
        console.log('GetCurrencyList', res);
        // this.filteredCount = this.dataList.length;
      },
      (error: any) => {
        this._spinner.hide();
      }
    );
  }
 
  onSubmit() {
    this._spinner.show();
    console.log(this.fournisseurForm, 'form value');
    if (this.isEditMode) {
      this.utilisateurService
        .UpdateFournisseurs(this.id, this.fournisseurForm.value)
        .then(
          (response: any) => {
            console.log(' mis à jour avec succès', response);
            this._spinner.hide();
            this.fournisseurForm.reset();
            this.OnCloseModal();
            this.GetFournisseursList(1);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
    } else {
      this.utilisateurService
        .CreateFournisseurs(this.fournisseurForm.value)
        .then(
          (response: any) => {
            console.log('Nouveau fournisseur créé avec succès', response);
            this._spinner.hide();
            this.fournisseurForm.reset();
            this.OnCloseModal();
            this.GetFournisseursList(1);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
    }
  }
  OnDelete(id: number) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed) {
          this._spinner.show();
          this.utilisateurService
            .DeletedFournisseurs(id)
            .then((res: any) => {
              console.log('DATA:::>', res);
              this.toastr.success(res.message);
              this.GetFournisseursList(1);
              this._spinner.hide();
            })
            .catch((err) => {
              console.error(err);
              this.toastr.error(
                'Erreur!',
                'Une erreur est survenue lors de la suppression.'
              );
              this._spinner.hide();
            });
        }
      }
    );
  }

  protected readonly event = event;
}
