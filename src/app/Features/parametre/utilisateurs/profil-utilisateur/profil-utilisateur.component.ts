import { Component, ViewChild } from '@angular/core';
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
  ProfilForm!: FormGroup;
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
  dataListPlastiqueNu: any = [];
  dataListLiquides: any = [];
  dataListArticlesProduits: any = [];
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  constructor(
    private _userService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.ProfilForm = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
    });
    this._userService.ListProfils.subscribe((res: any) => {
      this.dataListProduits = res;
    });

    this.GetProfilList(1);
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
    this.ProfilForm.reset();
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
      this.totalPages = res.total * data.limit; // nombre total d’enregistrements
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
            console.log('article mis à jour avec succès', response);
            this.OnCloseModal();
            this.GetProfilList(1);
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this._userService.CreateProfil(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetProfilList(1);
            this.ProfilForm.reset();
            this.toastr.success(response.message);
            // this.toastr.success('Succès!', 'Article créé avec succès.');
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
