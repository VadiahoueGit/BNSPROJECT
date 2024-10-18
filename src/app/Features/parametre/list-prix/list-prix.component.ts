import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';

@Component({
  selector: 'app-list-prix',
  templateUrl: './list-prix.component.html',
  styleUrls: ['./list-prix.component.scss'],
})
export class ListPrixComponent implements OnInit {
  dataList = [];
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  articleId: any;
  articleForm: any;
  constructor(
    private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService
  ) {}
  ngOnInit() {
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
  OnDelete(event: any) {}

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.articleForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
}
