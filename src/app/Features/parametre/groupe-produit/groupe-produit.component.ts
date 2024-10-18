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

@Component({
  selector: 'app-groupe-produit',
  templateUrl: './groupe-produit.component.html',
  styleUrls: ['./groupe-produit.component.scss']
})
export class GroupeProduitComponent {
  
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList!:any[];
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation:string = ''
  constructor(private articleService: ArticleServiceService, private _spinner:NgxSpinnerService) { }

  ngOnInit() {
    this.GetGroupeProduitList()
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

  GetGroupeProduitList()
  {
    let data = {
      paginate: true,
      page:1,
      limit:8
    }
    this._spinner.show()
    this.articleService.GetGroupeArticleList(data).then((res:any)=>{
      console.log('DATA:::>',res)
      this.dataList = res.data
      this._spinner.hide()
    })
  }
}
