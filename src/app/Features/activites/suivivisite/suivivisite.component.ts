import { Component, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ActiviteService } from 'src/app/core/activite.service';

@Component({
  selector: 'app-suivivisite',
  templateUrl: './suivivisite.component.html',
  styleUrls: ['./suivivisite.component.scss']
})
export class SuivivisiteComponent {
  @ViewChild('dt2') dt2!: Table;
  dataList!: any[];
  visiteDetail: any
  isModalOpen: boolean = false;

  currentPage:any
  rowsPerPage:any
  constructor(
    private _spinner: NgxSpinnerService,
    private activiteService: ActiviteService
  ) { }
  ngOnInit() {
    this.LoadVisite(1);
  }

  ViewDetails(data: any) {
    this.isModalOpen = true;
    console.log(this.isModalOpen);
  
    this.visiteDetail = data
    this.getFormattedDuration()
    console.log(this.visiteDetail);
  }

  getFormattedDuration(): string {
    const start = new Date(this.visiteDetail.DateDebut);
    const end = new Date(this.visiteDetail.DateFin);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  }
  
  LoadVisite(page: number ) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    console.log(data)
    this._spinner.show()
    this.activiteService.GetVisiteList(data).then((res: any) => {
      this.dataList = res.data;
      this._spinner.hide()
      console.log('Visite', res)
    }, (error: any) => {
      this._spinner.hide()
    })
  }


  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }


  // Méthode pour gérer la pagination
onPage(event: any) {
  this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
  this.rowsPerPage = event.rows;
  this.LoadVisite(this.currentPage);
}

}
