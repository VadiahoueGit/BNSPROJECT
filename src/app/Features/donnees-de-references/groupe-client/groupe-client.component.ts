import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { ArticleComponent } from '../../parametre/article/article.component';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-groupe-client',
  templateUrl: './groupe-client.component.html',
  styleUrls: ['./groupe-client.component.scss']
})
export class GroupeClientComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  GroupeClientForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  groupeClientId: any = 0;
  isEditMode: boolean = false;
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any = [];
  dataListGroupeArticles: any = [];
  dataListBouteilleVide: any = [];
  dataListPlastiqueNu: any = [];
  dataListLiquides: any = [];
  dataListArticlesProduits: any = [];
  dataListTypePrix: any[]=[];
  dataListPrix: any[]=[];
  dataListUsers: any;
  dataListlocalite: any;
  currentPage: number;
  rowsPerPage: any;
  totalPages: any;
  constructor(
    private _userService: UtilisateurResolveService,
    private location: Location,
    private _articleService: ArticleServiceService,
    private _coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}
  ngAfterViewInit(): void {
    // Initialisation de Bootstrap Select
    // $('.selectpicker').selectpicker('refresh');
  }
  ngOnInit() {
    this._articleService.ListTypePrix.subscribe((res: any) => {
      console.log('ListTypePrix:::>', res);
      this.dataListTypePrix = res
    });
    this._articleService.ListPrix.subscribe((res: any) => {
      console.log('ListPrix:::>', res);
      this.dataListPrix = res
    });
   
   
    this.GroupeClientForm = this.fb.group({
      nomGroupe: [null, Validators.required],
      listePrix: [0, Validators.required],
     prixReelId: [0, Validators.required],
    });


    this.GetGroupeClientList(1);
  }
  goBack() {
    this.location.back()
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
    this.GroupeClientForm.reset();
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.groupeClientId = data.id;
    this.isModalOpen = true;
    this.loadDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetGroupeClientList(page:number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._articleService.GetGroupeClientList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.totalPages = res.total * data.limit; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);
      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetGroupeClientList(this.currentPage);
  }

  onSubmit(): void {
    console.log(this.GroupeClientForm.value);
    if (this.GroupeClientForm.valid) {
      // const formValues = this.GroupeClientForm.value;
      const formValues = {
        ...this.GroupeClientForm.value,
        listePrix: +this.GroupeClientForm.value.listePrix,
        prixReelId: +this.GroupeClientForm.value.prixReelId,

      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this._coreService.UpdateGroupeClient(this.groupeClientId, formValues).then(
          (response: any) => {
            console.log('Utilisateur mis à jour avec succès', response);
            // this.toastr.success('Succès!', 'Utilisateur  mis à jour avec succès.');
            this.toastr.success(response.message);

            this.OnCloseModal();
            this.GroupeClientForm.reset();
            this.GetGroupeClientList(1);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._coreService.CreateGroupeClient(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetGroupeClientList(1);
            this.GroupeClientForm.reset();
            // this.toastr.success('Succès!', 'Utilisateur créé avec succès.');
            this.toastr.success(response.message);

            console.log('Nouvel Utilisateur créé avec succès', response);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  loadDetails(): void {
    this.GroupeClientForm.patchValue({
      nomGroupe: this.updateData.nomGroupe,
      prixReelId: this.updateData.prixReelId.id,
      listePrix: this.updateData.listePrix.id,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this._coreService.DeleteGroupeClient(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetGroupeClientList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  OnDisabled(data:any){
    console.log(data,'data')
  }
}
