import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-liquide',
  templateUrl: './liquide.component.html',
  styleUrls: ['./liquide.component.scss'],
})
export class LiquideComponent {
  dataList = [];
  dataListTypesPrix: any = [];
  dataListProduits: any = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  emballageId: any = 0;
  liquideForm!: FormGroup;
  dataListGroupeArticles: any = [];
  dataListPlastiqueNu: any = [];
  dataListEmballage: any = [];
  dataListBouteilleVide: any = [];
  dataListLiquides: any = [];
  dataListFormats: any= [];
  dataListConditionnements: any= [];
  currentPage: number;
  rowsPerPage: any;
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,

  ) {}
  ngOnInit() {
    this.liquideForm = this.fb.group({
      code: [null, Validators.required],
      libelle: [null, Validators.required],
      format: [null, Validators.required],
      condition: [null, Validators.required],
      plastiquenuId: [0, Validators.required],
      bouteillevideId: [0, Validators.required],
      categorieproduitId: [0, Validators.required],
      groupearticleId: [0, Validators.required],
      emballageId: [0, Validators.required],
    });
    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res ?? [];
      console.log(this.dataListProduits, 'this.dataListProduits ');
    });
    this.articleService.ListGroupesArticles.subscribe((res: any) => {
      this.dataListGroupeArticles = res ?? [];
    });
    this.articleService.ListPlastiquesNu.subscribe((res: any) => {
      this.dataListPlastiqueNu = res ?? [];
    });
    this.articleService.ListEmballages.subscribe((res: any) => {
      this.dataListEmballage = res ?? [];
      console.log('dataListEmballage:::>', this.dataListEmballage);
    });
    this.articleService.ListBouteilleVide.subscribe((res: any) => {
      this.dataListBouteilleVide = res ?? [];
    });
    this.articleService.ListLiquides.subscribe((res: any) => {
      this.dataListLiquides = res ?? [];
      console.log('dataListLiquides:::>', this.dataListLiquides);
    });
    this.articleService.GetFormatList().then((res: any) => {
      this.dataListFormats = res;
      console.log('dataListFormats:::>', this.dataListFormats);
    });

    this.articleService.GetConditionnementList().then((res: any) => {
      this.dataListConditionnements = res;
      console.log('dataListConditionnements:::>', this.dataListConditionnements);
    });
    this.GetLiquideList(1)
  }

  GetLiquideList(page:number) {
    let data = {
      paginate: false,
      page:page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetLiquideList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListLiquides = res.data ?? [];
      this._spinner.hide();
    });
  }

  filterGlobal(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || '';
    this.dt2.filterGlobal(value, 'contains');
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetLiquideList(this.currentPage);
  }
  onSubmit(): void {
    console.log(this.liquideForm.value);
    if (this.liquideForm.valid) {
      // const formValues = this.liquideForm.value;
      const formValues = {
        ...this.liquideForm.value,
        plastiquenuId: +this.liquideForm.value.plastiquenuId,
        bouteillevideId: +this.liquideForm.value.bouteillevideId,
        categorieproduitId: +this.liquideForm.value.categorieproduitId,
        groupearticleId: +this.liquideForm.value.groupearticleId,
        emballageId: +this.liquideForm.value.emballageId,

      };
      console.log('formValues', formValues);

      if (this.isEditMode) {

        this.articleService.UpdateLiquide(this.emballageId, formValues).then(
          (response: any) => {
            console.log('liquide mis à jour avec succès', response);
            this.liquideForm.reset()
            this.OnCloseModal();
            this.GetLiquideList(1);
            this.toastr.success(response.message);
            console.log('Groupe article mis à jour avec succès', response);


          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      } else {
        this.articleService.CreateLiquide(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetLiquideList(1);
            this.liquideForm.reset();
            this.toastr.success(response.message);
            // this.toastr.success('Succès!', 'Liquide crée avec succès.');
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
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
    this.emballageId = data.id;
    this.loadLiquideDetails();
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  loadLiquideDetails(): void {
    this.liquideForm.patchValue({
      code: this.updateData.code,
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      condition: this.updateData.condition,
      plastiquenuId: this.updateData.plastiquenu?.id,
      bouteillevideId: this.updateData.bouteillevide?.id,
      categorieproduitId: this.updateData.categorieproduit?.id,
      groupearticleId: this.updateData.groupearticle?.id,
      emballageId: this.updateData.emballage?.id,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeleteLiquide(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetLiquideList(1)
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
}
