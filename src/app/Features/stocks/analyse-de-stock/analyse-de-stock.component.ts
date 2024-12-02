import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-analyse-de-stock',
  templateUrl: './analyse-de-stock.component.html',
  styleUrls: ['./analyse-de-stock.component.scss']
})
export class AnalyseDeStockComponent {
  dataList = [
    {
      date: '2024-11-30',
      partenaire: 'Client A',
      article: 'Article 1',
      magasin: 'Magasin A',
      mouvement: 'Entrée'
    },
    {
      date: '2024-11-29',
      partenaire: 'Client B',
      article: 'Article 2',
      magasin: 'Magasin B',
      mouvement: 'Sortie'
    },
    {
      date: '2024-11-28',
      partenaire: 'Client C',
      article: 'Article 3',
      magasin: 'Magasin A',
      mouvement: 'Transfert'
    }
  ];
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  // dataList:any =[];
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation:string = ''
  updateData: any = {};
  groupeId : number = 0
  isEditMode: boolean = false;
  currentPage: number;
  rowsPerPage: any;
  
  constructor(private articleService: ArticleServiceService, private _spinner:NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private location: Location,
  ) { }

  ngOnInit() {

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
  goBack() {
    this.location.back()
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
      // this.dataList = res.data
      this._spinner.hide()
    })
  }
}
