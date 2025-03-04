import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';

@Component({
  selector: 'app-revendeur',
  templateUrl: './revendeur.component.html',
  styleUrls: ['./revendeur.component.scss'],
})
export class RevendeurComponent {
  dataList: any[] = [];
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
  revendeurForm!: FormGroup;
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
  numeroSap: string | Blob;
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
    this.revendeurForm = this.fb.group({
      groupeClientId: [null, Validators.required],
      numeroRegistre: [null],
      raisonSocial: [null, Validators.required],
      contact: [''],
      longitude: [null, Validators.required],
      latitude: [null, Validators.required],
      telephone: [''],
      localiteId: [0, Validators.required],
      depotId: [0, Validators.required],
      zoneDeLivraisonId: [0, Validators.required],
      nomProprietaire: ['', Validators.required],
      telephoneProprietaire: [''],
      nomGerant: ['', Validators.required],
      telephoneGerant: [''],
      quantiteMinimumACommander: [0, Validators.min(0)],
      numeroCompteContribuable: [''],
      familleProduitId: [0, Validators.required],
    });

    this._articleService.ListGroupeRevendeurs.subscribe((res: any) => {
      console.log(res, 'res client groupe');
      this.clientTypes = res;
    });
    this.coreService.listLocalite.subscribe((res: any) => {
      console.log(res, 'res localites');
      this.localites = res;
    });
    this._articleService.ListGroupesArticles.subscribe((res: any) => {
      console.log(res, 'res ListGroupesArticles');
      this.ListGroupesArticles = res;
    });

    // this.GetLocaliteList();
    this.GetDepotList();
    this.GetZoneList();
    this.GetRevendeurList(1);
  }
  onRccmSelected(event: any) {
    this.selectedRccmFile = event.target.files[0];
  }

  onCniSelected(event: any) {
    this.selectedCniFile = event.target.files[0];
  }

  onDfeSelected(event: any) {
    this.selectedDfeFile = event.target.files[0];
  }
  goBack() {
    this.location.back();
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetRevendeurList(this.currentPage);
  }
  OnCreate() {
    this.revendeurForm.enable();
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
  loadClientDetails(): void {
    this.revendeurForm.patchValue({
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
    console.log(this.revendeurForm);
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

  OnCloseDetailModal() {
    this.isModalDetail = false;
    this.numeroSap = '';
    console.log(this.isModalOpen);
  }
  selectedFile: File | null = null;
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0]; // Récupérer le fichier sélectionné
  }
  confirmValidateOperation(revendeur: any) {
    // Vérifier que la CNI et le numéro SAP sont sélectionnés
    if (!this.selectedCniFile || !this.numeroSap) {
      this.toastr.warning(
        'Erreur!',
        'Veuillez sélectionner la CNI et le numéro SAP.'
      );
      return;
    }

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
          formData.append('registre', this.selectedRccmFile!);  // Ce champ n'est plus requis
          formData.append('dfe', this.selectedDfeFile!);  // Ce champ n'est plus requis
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
    this.revendeurForm.reset();
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
          this.revendeurForm.patchValue({
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
      this._spinner.hide();
    });
  }
  onSubmit() {
    this._spinner.show();
    console.log(this.revendeurForm, 'form value');
    if (this.isEditMode) {
      this._articleService
        .UpdateRevendeur(this.id, this.revendeurForm.value)
        .then(
          (response: any) => {
            console.log(' mis à jour avec succès', response);
            this._spinner.hide();
            this.revendeurForm.reset();
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
      this._articleService.CreateRevendeur(this.revendeurForm.value).then(
        (response: any) => {
          console.log('Nouveau revendeur créé avec succès', response);
          this._spinner.hide();
          this.revendeurForm.reset();
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
}
