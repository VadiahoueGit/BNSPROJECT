import { Component, ViewChild } from '@angular/core';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent {

  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!:any[];
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation:string = ''
  constructor(private articleService: ArticleServiceService, private _spinner:NgxSpinnerService) { }

  ngOnInit() {
    this.GetProduitList()
  }
  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }
  
  clear(table: Table) {
    table.clear();
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

  OnEdit()
  {
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen)
  }

  OnDelete()
  {
    ALERT_QUESTION('warning','Attention !','Voulez-vous supprimer?').then((res)=>{
      if (res.isConfirmed == true) {

      }else{
        
      }
    })
  }

  GetProduitList()
  {
    let data = {
      paginate: true,
      page:1,
      limit:8
    }
    this._spinner.show()
    this.articleService.GetArticleList(data).then((res:any)=>{
      console.log('DATA:::>',res)
      this.dataList = res.data
      this._spinner.hide()
    })
  }
}