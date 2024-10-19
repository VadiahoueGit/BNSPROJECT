import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';

@Component({
  selector: 'app-creation-prix',
  templateUrl: './creation-prix.component.html',
  styleUrls: ['./creation-prix.component.scss']
})
export class CreationPrixComponent {
  dataList = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  articleId: any;
  prixForm!: FormGroup;
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {}
  ngOnInit() {
    this.prixForm = this.fb.group({
      libelle: ['', Validators.required],
      code: ['', Validators.required],
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
  onSubmit(){}
  
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
    this.articleId = data.id;
    this.prixForm.patchValue(data);
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
