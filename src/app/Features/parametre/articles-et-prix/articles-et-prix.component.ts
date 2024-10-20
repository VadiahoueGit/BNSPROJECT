import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Customer } from 'src/domain/customer';

@Component({
  selector: 'app-articles-et-prix',
  templateUrl: './articles-et-prix.component.html',
  styleUrls: ['./articles-et-prix.component.scss'],
})
export class ArticlesEtPrixComponent implements OnInit {
  public activeTab: string = 'groupeProduits';
  customers!: Customer[];
  loading: boolean = true;
  selected = [];
  rows: any = [];

  
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit(): void {

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
