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
  isModalOpen:boolean = false;
  constructor(
    private _spinner: NgxSpinnerService,
    private activiteService:ActiviteService
  ) {}
  ngOnInit() {
    this.LoadVisite();
  }

  ViewDetails(data:any) {
    this.isModalOpen = true;
    console.log(this.isModalOpen);
  }

  LoadVisite()
  {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this._spinner.show()
    this.activiteService.GetVisiteList(data).then((res:any)=>{
      this.dataList = res.data;
      this._spinner.hide()
      console.log('Visite',res)
    })
  }
  

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
}
