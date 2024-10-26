import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';

@Component({
  selector: 'app-creation-prix',
  templateUrl: './creation-prix.component.html',
  styleUrls: ['./creation-prix.component.scss'],
})
export class CreationPrixComponent {
  dataList = [];
  dataListTypesPrix: any = [];
  dataListProduits: any = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  prixId: any;
  prixForm!: FormGroup;
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {}
  ngOnInit() {
    this.prixForm = this.fb.group({
      PrixLiquide: [null, Validators.required],
      PrixConsigne: [null,  Validators.required],
      Quantite: [null,  Validators.required],
      PrixId: [0,  Validators.required],
      ProduitId: [0,  Validators.required],
    });
    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res;
      console.log(this.dataListProduits ,"this.dataListProduits ")
    });
    this.articleService.ListTypePrix.subscribe((res: any) => {
      this.dataListTypesPrix = res;
      console.log(this.dataListTypesPrix ,"this.dataListTypesPrix ")
    });
    this.GetListPrix();
  }
  GetListPrix() {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetListPrix(data).then((res: any) => {
      console.log('DATAPRIX:::>', res);
      this.dataList = res.data;
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
    console.log(this.prixForm.value);
    if (this.prixForm.valid) {
      // const formValues = this.prixForm.value;
      const formValues = {
        ...this.prixForm.value,
        PrixId: +this.prixForm.value.PrixId,
        ProduitId: +this.prixForm.value.ProduitId,
       
      };
    
      if (this.isEditMode) {
        this.articleService.UpdatePrix(this.prixId, formValues).then(
          (response: any) => {
            console.log('prix mis à jour avec succès', response);
            this.prixForm.reset()
            this.OnCloseModal();
            this.GetListPrix();
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.articleService.CreatePrix(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetListPrix();
            this.prixForm.reset()
            console.log('Nouveau prix créé avec succès', response);
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
    this.prixId = data.id;
    this.prixForm.patchValue({
      Quantite: this.updateData.Quantite,
      PrixLiquide: this.updateData.PrixLiquide,
      PrixConsigne: this.updateData.PrixConsigne,
      PrixId: this.updateData.typePrix.id,
      // P roduitId: this.updateData.produit.id,
    }
    );
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletePrix(Id).then((res: any) => {
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
