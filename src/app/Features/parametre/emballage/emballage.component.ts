import { Component, ViewChild } from '@angular/core';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';

@Component({
  selector: 'app-emballage',
  templateUrl: './emballage.component.html',
  styleUrls: ['./emballage.component.scss'],
})
export class EmballageComponent {
  dataList = [];
  dataListTypesPrix: any = [];
  dataListProduits: any = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  emballageId: any = 0;
  emballageForm!: FormGroup;
  dataListGroupeArticles: any = [];
  dataListPlastiqueNu: any = [];
  dataListEmballage: any = [];
  dataListBouteilleVide: any = [];
  dataListFormats: any= [];
  dataListConditionnements: any= [];
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {}
  ngOnInit() {
    
    this.emballageForm = this.fb.group({
      libelle: [null, Validators.required],
      format: [null, Validators.required],
      condition: [null, Validators.required],
      plastiquenuId: [0, Validators.required],
      bouteillevideId: [0, Validators.required],
      categorieproduitId: [0, Validators.required],
      groupearticleId: [0, Validators.required],
    });
    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res;
      console.log(this.dataListProduits, 'this.dataListProduits ');
    });
    this.articleService.ListGroupesArticles.subscribe((res: any) => {
      this.dataListGroupeArticles = res;
    });
    this.articleService.ListPlastiquesNu.subscribe((res: any) => {
      this.dataListPlastiqueNu = res;
    });
    this.articleService.ListEmballages.subscribe((res: any) => {
      this.dataListEmballage = res;
      console.log('dataListEmballage:::>', this.dataListEmballage);
    });
    this.articleService.ListBouteilleVide.subscribe((res: any) => {
      this.dataListBouteilleVide = res;
    });
    this.articleService.GetFormatList().then((res: any) => {
      this.dataListFormats = res;
      console.log('dataListFormats:::>', this.dataListFormats);
    });

    this.articleService.GetConditionnementList().then((res: any) => {
      this.dataListConditionnements = res;
      console.log('dataListConditionnements:::>', this.dataListConditionnements);
    });
    this.GetEmballageList()
  }

  GetEmballageList() {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetEmballageList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListEmballage = res.data;
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
    console.log(this.emballageForm.value);
    if (this.emballageForm.valid) {
      // const formValues = this.emballageForm.value;
      const formValues = {
        ...this.emballageForm.value,
        plastiquenuId: +this.emballageForm.value.plastiquenuId,
        bouteillevideId: +this.emballageForm.value.bouteillevideId,
        categorieproduitId: +this.emballageForm.value.categorieproduitId,
        groupearticleId: +this.emballageForm.value.groupearticleId,
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {

        this.articleService.UpdateEmballage(this.emballageId, formValues).then(
          (response: any) => {
            console.log('emballage mis à jour avec succès', response);
            this.emballageForm.reset()
            this.OnCloseModal();
            this.GetEmballageList();
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.articleService.CreateEmballage(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetEmballageList();
            this.emballageForm.reset();
            console.log('Nouveau emballage créé avec succès', response);
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
    this.loadEmballageDetails();
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  loadEmballageDetails(): void {
    this.emballageForm.patchValue({
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      condition: this.updateData.condition,
      plastiquenuId: this.updateData.plastiquenu.id,
      bouteillevideId: this.updateData.bouteillevide.id,
      categorieproduitId: this.updateData.categorieproduit.id,
      groupearticleId: this.updateData.groupearticle.id,
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
