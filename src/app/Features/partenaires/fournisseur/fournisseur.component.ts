
import { Location } from '@angular/common';
import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import {Table} from "primeng/table";

@Component({
  selector: 'app-fournisseur',
  templateUrl: './fournisseur.component.html',
  styleUrls: ['./fournisseur.component.scss']
})
export class FournisseurComponent {

  dataList: any[] = [];
  selectedRevendeur:any;
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
      codeFss: [''],
      nomFournisseur: ['', Validators.required],
      codeGroupe: ['', Validators.required],
      adresse: ['', Validators.required],
      pays: ['', Validators.required],
      devise: ['', Validators.required],
      telephone1: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      telephone2: ['', Validators.pattern('^[0-9]+$')],
      siteWeb: ['', Validators.pattern('https?://.+')]
    });

  }

  goBack() {
    this.location.back();
  }
  updateFilteredCount(table: any) {
    this.filteredCount = table.filteredValue ? table.filteredValue.length : this.dataList.length;
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetRevendeurList(this.currentPage);
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


  preloadData(event:any): void {
    this.selectedRevendeur = event
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
      isAssocie: this.updateData.isAssocie,
      groupeClientId: this.updateData.groupeClient.id,
      numeroRegistre: this.updateData.numeroRegistre,
      raisonSocial: this.updateData.raisonSocial,
      contact: this.updateData.contact,
      longitude: this.updateData.longitude,
      latitude: this.updateData.latitude,
      telephone: this.updateData.telephone,
      localiteId: this.updateData.localite.id,
      depotId: this.updateData.depot.id,
      zoneDeLivraisonId: this.updateData.zoneDeLivraison.id,
      nomProprietaire: this.updateData.nomProprietaire,
      telephoneProprietaire: this.updateData.telephoneProprietaire,
      nomGerant: this.updateData.nomGerant,
      telephoneGerant: this.updateData.telephoneGerant,
      quantiteMinimumACommander: this.updateData.quantiteMinimumACommander,
      numeroCompteContribuable: this.updateData.numeroCompteContribuable,
      familleProduitId: this.updateData.familleProduitId,
    });
    console.log(this.fournisseurForm);
    if (this.updateData.numeroSAP != "")
    {
      this.numeroSap = this.updateData.numeroSAP;
    }
  }

  OnValidate(data: any) {
    if(!data.isValide)
    {
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
    }else{
      this.toastr.warning('Ce revendeur a déja été validé');
    }

  }

  filterGlobal(event:any) {
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
    // Vérifier que la CNI et le numéro SAP sont sélectionnés
    // if (!this.selectedCniFile || !this.numeroSap) {
    //   this.toastr.warning(
    //     'Erreur!',
    //     'Veuillez sélectionner la CNI et le numéro SAP.'
    //   );
    //   return;
    // }

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
              this.GetRevendeurList(1);
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

  // confirmValidateOperation(data: any) {
  //   if (!data.isValide) {
  //     ALERT_QUESTION(
  //       'warning',
  //       'Attention !',
  //       'Voulez-vous valider ce revendeur?'
  //     ).then((res) => {
  //       if (res.isConfirmed == true) {
  //         this._spinner.show();
  //         this._articleService.ValidateRevendeur( data.id,data)
  //           .then((res: any) => {
  //             console.log('VALIDEEEEEEEEEE:::>', res);
  //             this.toastr.success(res.message);
  //             this.OnCloseDetailModal()
  //             this._spinner.hide();
  //             this.GetRevendeurList(1);
  //           },
  //           (error: any) => {
  //             this._spinner.hide();
  //             this.toastr.error('Erreur!', 'Erreur lors de la validation.');
  //             console.error('Erreur lors de la validation', error);
  //           });
  //       }else {
  //         this.isModalDetail = false
  //       }
  //     });
  //   }
  // }
  OnCloseModal() {
    this.isModalOpen = false;
    this.fournisseurForm.reset();
  }
  onDepotChange(event: any): void {
    const depotId = event?.id;
    console.log(event, 'depotId');
    if (depotId) {
      this.getDepotDetails(depotId);
    }
  }
  GetDepotList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetDepotList(data).then((res: any) => {
      this.depots = res.data;
      console.log('GetDepotList:::>', this.depots);
      this._spinner.hide();
    });
  }
  GetZoneList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetZoneList(data).then((res: any) => {
      console.log('GetZoneList:::>', res);
      this.zoneLivraison = res.data;
      this._spinner.hide();
    });
  }
  getDepotDetails(depotId: number): void {
    this.coreService
      .GetDepotDetail(depotId)
      .then((response: any) => {
        if (response) {
          console.log(response, 'response');
          this.fournisseurForm.patchValue({
            localiteId: response.data.zone.localite?.id || null,
          });
        }
      })
      .catch((error: any) => {
        console.error(
          'Erreur lors de la récupération des informations du dépôt:',
          error
        );
      });
  }
  activateField(data:boolean)
  {
    this.isActive = data;
    if (!this.isActive)
    {
      this.fournisseurForm.reset();
      this.selectedRevendeur = null;
    }

  }


  GetRevendeurList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._articleService.GetListRevendeur(data).then((res: any) => {
      console.log('GetListRevendeur:::>', res);
      this.dataList = res.data;
      this.revendeurConfirmed = res.data.filter(
        (i: any) => i.isAssocie === false && i.isValide === true
      );

      this.filteredCount = this.dataList.length;
      this._spinner.hide();
    });
  }
  onSubmit() {
    this._spinner.show();
    console.log(this.fournisseurForm, 'form value');
    if (this.isEditMode) {
      this._articleService
        .UpdateRevendeur(this.id, this.fournisseurForm.value)
        .then(
          (response: any) => {
            console.log(' mis à jour avec succès', response);
            this._spinner.hide();
            this.fournisseurForm.reset();
            this.OnCloseModal();
            this.GetRevendeurList(1);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
    } else {
      this.fournisseurForm.controls['isAssocie'].setValue(this.isActive)

      if (this.isActive)
      {
        this.fournisseurForm.controls['parentRevendeurId'].setValue(this.selectedRevendeur.id)
      }
      this._articleService.CreateRevendeur(this.fournisseurForm.value).then(
        (response: any) => {
          console.log('Nouveau revendeur créé avec succès', response);
          this._spinner.hide();
          this.fournisseurForm.reset();
          this.OnCloseModal();
          this.GetRevendeurList(1);
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
          this._articleService
            .DeleteRevendeur(id)
            .then((res: any) => {
              console.log('DATA:::>', res);
              this.toastr.success(res.message);
              this.GetRevendeurList(1);
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

