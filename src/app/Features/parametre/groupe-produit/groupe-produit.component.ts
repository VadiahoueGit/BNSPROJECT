import { Component, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { CustomerService } from 'src/service/customerservice';
import { Customer, Representative } from 'src/domain/customer';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-groupe-produit',
  templateUrl: './groupe-produit.component.html',
  styleUrls: ['./groupe-produit.component.scss']
})
export class GroupeProduitComponent {
  groupeProduitForm!: FormGroup
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList:any =[];
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation:string = ''
  updateData: any = {};
  groupeId : number = 0
  isEditMode: boolean = false;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  constructor(private articleService: ArticleServiceService, private _spinner:NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,

  ) { }

  ngOnInit() {
    this.groupeProduitForm = this.fb.group({
      libelle: ['', Validators.required],
      code: ['', Validators.required],
    });
    this.GetGroupeProduitList(1)
  }

  clear(table: Table) {
    table.clear();
  }
  filterGlobal(event:any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || ''; // Utilisez une valeur par défaut
    this.dt2.filterGlobal(value, 'contains');
  }
  OnCloseModal()
  {
    this.isModalOpen = false;
    console.log(this.isModalOpen)
  }
  OnCreate()
  {
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen)
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetGroupeProduitList(this.currentPage);
  }
  onSubmit(): void {
    console.log(this.groupeProduitForm.value);
    if (this.groupeProduitForm.valid) {
      const formValues = this.groupeProduitForm.value;
      this.groupeProduitForm.patchValue(this.updateData);
      if (this.isEditMode) {
        this.articleService.UpdateGroupeArticle(this.groupeId, formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetGroupeProduitList(1);
            this.toastr.success(response.message);
            console.log('Groupe article mis à jour avec succès', response);


          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      } else {
        this.articleService.CreateGroupeArticle(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this.GetGroupeProduitList(1);
            this.groupeProduitForm.reset()
            this.toastr.success(response.message);
            console.log('emballage crée avec succès', response);

          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.groupeId = data.id;
    this.groupeProduitForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeleteGroupeArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetGroupeProduitList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  GetGroupeProduitList(page:number)
  {
    let data = {
      paginate: false,
      page:page,
      limit:8
    }
    this._spinner.show()
    this.articleService.GetGroupeArticleList(data).then((res:any)=>{
      console.log('DATA:::>',res)
      this.totalPages = res.totalPages * data.limit; // nombre total d’enregistrements

      this.dataList = res.data

      this._spinner.hide()
    })
  }
}
