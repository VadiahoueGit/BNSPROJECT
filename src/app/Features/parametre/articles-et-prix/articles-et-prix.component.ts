import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Customer } from 'src/domain/customer';

@Component({
  selector: 'app-articles-et-prix',
  templateUrl: './articles-et-prix.component.html',
  styleUrls: ['./articles-et-prix.component.scss'],
})
export class ArticlesEtPrixComponent implements OnInit {
  public activeTab: string = 'typeArticle';
  customers!: Customer[];
  loading: boolean = true;
  selected = [];
  rows: any = [];

  columns = [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'job', name: 'Job' },
  ];
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit(): void {
    setTimeout(() => {
      this.rows = [
        { name: 'John', age: 25, job: 'Engineer' },
        { name: 'Jane', age: 30, job: 'Designer' },
        { name: 'Paul', age: 28, job: 'Developer' },
      ];
      this.cd.detectChanges(); 
    }, 1000);
  }
  activeElement(elt: string) {
    this.activeTab = elt;
  }
  onActivate(event: any) {
    console.log('Activate Event', event);
  }

  onSelect(event: any) {
    console.log('Select Event', event);
  }
}
