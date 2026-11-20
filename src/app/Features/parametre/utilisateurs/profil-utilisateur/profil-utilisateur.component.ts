import { Component, ViewChild,ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { ALERT_QUESTION } from 'src/app/Features/shared-component/utils';

@Component({
  selector: 'app-profil-utilisateur',
  templateUrl: './profil-utilisateur.component.html',
  styleUrls: ['./profil-utilisateur.component.scss'],
})
export class ProfilUtilisateurComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!: any[];
  searchForm!: FormGroup;
  ProfilForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = null;
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
  totalPages: number;
  filteredPermissionList: any = []
  permissionList: any = []
  constructor(
    private cdr: ChangeDetectorRef,
    private _userService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {

  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchQuery: ['', Validators.required]
    });
    this.ProfilForm = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
    });
    this._userService.ListProfils.subscribe((res: any) => {
      this.dataListProduits = res;
    });
    this.GetPermissionList(1)
    this.GetProfilList(1);
  }

  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  filterData(): void {
    const query = this.searchForm.get('searchQuery')?.value;

    if (!query) {
      this.filteredPermissionList = this.permissionList;
    } else {
      this.filteredPermissionList = this.permissionList.filter((item: any) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }
  AssignPermissions(roleId: number, permissions: any[]) {
    let data = {
      roleId: roleId,
      permissions: permissions.map((p: any) => ({
        permissionId: p.id,
        peutVoir: !!p.peutVoir,
        peutCreer: !!p.peutCreer,
        peutModifier: !!p.peutModifier,
        peutSupprimer: !!p.peutSupprimer,
      })),
    };
    this._spinner.show();
    this._userService.AssignPermissions(data).then((response: any) => {
      this._spinner.hide()
      if (response.statusCode === 200) {
        this.OnCloseModal();
        this.GetProfilList(1);
        this.ProfilForm.reset();
      } else {
        this.toastr.error(response.message);
      }
    })
  }
  GetPermissionList(page: number) {
    this._spinner.show();

    const data = {
      paginate: false,
      page: page,
      limit: 8,
    };

    this._userService.GetPermissionsList(data).then((response: any) => {
      this._spinner.hide();

      // rolePermissions du rôle en cours d'édition : {permission: {id, ...}, peutVoir, peutCreer, peutModifier, peutSupprimer}
      const existingByPermissionId = new Map<number, any>();
      if (this.updateData?.rolePermissions) {
        this.updateData.rolePermissions.forEach((rp: any) => {
          if (rp.permission?.id) existingByPermissionId.set(rp.permission.id, rp);
        });
      }

      // permissionList porte les flags peut* : c'est la liste "source de vérité" envoyée à la
      // sauvegarde. filteredPermissionList n'en est qu'une VUE filtrée (.filter, pas .map) —
      // elle doit garder les mêmes références d'objet, sinon cocher une case dans la vue
      // filtrée ne modifie qu'une copie et n'a aucun effet sur ce qui est réellement sauvegardé.
      this.permissionList = (response.data || []).map((p: any) => {
        const existing = existingByPermissionId.get(p.id);
        return {
          ...p,
          peutVoir: !!existing?.peutVoir,
          peutCreer: !!existing?.peutCreer,
          peutModifier: !!existing?.peutModifier,
          peutSupprimer: !!existing?.peutSupprimer,
        };
      });
      this.filteredPermissionList = this.permissionList;

      this.cdr.detectChanges();
      console.log(this.filteredPermissionList);
    });
  }


  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnCreate() {
    this.ProfilForm.reset();
    this.isEditMode = false;
    this.updateData = null;
    this.GetPermissionList(1);
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.GetPermissionList(1)
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  GetProfilList(page:number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._userService.GetListProfil(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataList = res.data;
      this.totalPages = res.total ; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages);

      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetProfilList(this.currentPage);
  }
  onSubmit(): void {
    console.log(this.ProfilForm.value);
    if (this.ProfilForm.valid) {
      // const formValues = this.ProfilForm.value;
      const formValues = {
        ...this.ProfilForm.value,
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this._userService.UpdateProfil(this.articleId, formValues).then(
          (response: any) => {
            if (response.statusCode === 201) {
              // this.permissionList (liste complète), pas filteredPermissionList qui peut être
              // réduite par la recherche — sinon les permissions non affichées seraient effacées.
              this.AssignPermissions(this.articleId,this.permissionList);
              this.toastr.success(response.message);
            }
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._userService.CreateProfil(formValues).then(
          (response: any) => {
            if (response.statusCode === 201) {
              this.AssignPermissions(response.data.id,this.permissionList);
              this.toastr.success(response.message);
            }
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
  loadArticleDetails(): void {
    this.ProfilForm.patchValue({
      name: this.updateData.name,
      description: this.updateData.description,
    });
  }
  OnDelete(id: number) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed) {
          this._spinner.show();
          this._userService
            .DeleteProfil(id)
            .then((res: any) => {
              console.log('DATA:::>', res);
              this.toastr.success(res.message);
              this.GetProfilList(1)
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
