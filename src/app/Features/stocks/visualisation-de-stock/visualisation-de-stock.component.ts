import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { Location } from '@angular/common';
import { CoreServiceService } from '../../../core/core-service.service';

@Component({
  selector: 'app-visualisation-de-stock',
  templateUrl: './visualisation-de-stock.component.html',
  styleUrls: ['./visualisation-de-stock.component.scss']
})
export class VisualisationDeStockComponent {
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

  dataList : any[] = [];
  allDataList: any[] = [];
  depotList: any[] = [];
  selectedDepotId: any = null;
  selectedDate: string = '';
  now: string = new Date().toISOString().slice(0, 10);
  constructor(private articleService: ArticleServiceService, private _spinner:NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private location: Location,
    private coreService: CoreServiceService,
  ) { }

  ngOnInit() {
    this.GetGroupeProduitList(1)
    this.GetDepotList()
  }

  GetDepotList() {
    this.coreService.GetDepotList({ paginate: false, page: 1, limit: 100 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  onDepotFilterChange() {
    this.applyDepotFilter();
  }

  onDateFilterChange() {
    this.GetGroupeProduitList(1);
  }

  resetDateFilter() {
    this.selectedDate = '';
    this.GetGroupeProduitList(1);
  }

  applyDepotFilter() {
    if (!this.selectedDepotId) {
      this.dataList = this.allDataList;
      return;
    }
    this.dataList = this.allDataList
      .map((item: any) => ({
        ...item,
        stockByDepot: item.stockByDepot.filter((d: any) => d.depotId === this.selectedDepotId),
      }))
      .filter((item: any) => item.stockByDepot.length > 0);
  }

  clear(table: Table) {
    table.clear();
  }
  filterGlobal(event:any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value || ''; // Utilisez une valeur par défaut
    this.dt2?.filterGlobal(value, 'contains');
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
    this.articleService.GetStocksDetails(this.selectedDate).then((res: any) => {
      if(res.statusCode === 201) {
        this.allDataList = res.data.map((item: any) => {
          let code = item.code;
          if (code.startsWith('CAS')) {
            code = 'CCAS' + code.slice(3);
          } else if (code.startsWith('EMB')) {
            code = 'VEMB' + code.slice(3);
          }
          return { ...item, code };
        });
        this.applyDepotFilter();
      }

      this._spinner.hide();
    });
  }
}
