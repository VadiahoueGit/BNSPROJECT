import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';

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
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {}
  ngOnInit() {
    this.liquideForm = this.fb.group({
      libelle: [null, Validators.required],
      format: [null, Validators.required],
      condition: [null, Validators.required],
      plastiquenuId: [0, Validators.required],
      bouteillevideId: [0, Validators.required],
      categorieProduitId: [0, Validators.required],
      groupeArticleId: [0, Validators.required],
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
    this.GetLiquideList()
  }

  GetLiquideList() {
    let data = {
      paginate: true,
      page: 1,
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
  onSubmit(): void {
    console.log(this.liquideForm.value);
    if (this.liquideForm.valid) {
      // const formValues = this.liquideForm.value;
      const formValues = {
        ...this.liquideForm.value,
        plastiquenuId: +this.liquideForm.value.plastiquenuId,
        bouteillevideId: +this.liquideForm.value.bouteillevideId,
        categorieproduitId: +this.liquideForm.value.categorieProduitId,
        groupearticleId: +this.liquideForm.value.groupeArticleId,
        emballageId: +this.liquideForm.value.emballageId,
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this.loadLiquideDetails();

        this.articleService.UpdateLiquide(this.emballageId, formValues).then(
          (response: any) => {
            console.log('liquide mis à jour avec succès', response);
            this.OnCloseModal();
            this.GetLiquideList();
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.articleService.CreateLiquide(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetLiquideList();
            this.liquideForm.reset();
            console.log('Nouveau liquide créé avec succès', response);
          },
          (error: any) => {
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
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      condition: this.updateData.condition,
      plastiquenuId: this.updateData.plastiquenuId,
      bouteillevideId: this.updateData.bouteillevideId,
      categorieProduitId: this.updateData.categorieProduitId,
      groupeArticleId: this.updateData.groupeArticleId,
      emballageId: this.updateData.emballageId,
    });
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeleteEmballage(Id).then((res: any) => {
            console.log('DATA:::>', res);
            // this.dataList = res.data;
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
}