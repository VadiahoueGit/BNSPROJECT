import { Component, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-suivivisite',
  templateUrl: './suivivisite.component.html',
  styleUrls: ['./suivivisite.component.scss']
})
export class SuivivisiteComponent {
  @ViewChild('dt2') dt2!: Table;
  dataList: any[]=[{},{}];
}
