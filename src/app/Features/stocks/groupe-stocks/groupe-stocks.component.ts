import { ChangeDetectorRef, Component } from '@angular/core';
import { Location } from '@angular/common';
import { Customer } from 'src/domain/customer';

@Component({
  selector: 'app-groupe-stocks',
  templateUrl: './groupe-stocks.component.html',
  styleUrls: ['./groupe-stocks.component.scss']
})
export class GroupeStocksComponent {
  public activeTab: string = 'inventaireDepot';
  customers!: Customer[];
  loading: boolean = true;
  selected = [];
  rows: any = [];

  
  constructor(private location: Location,private cd: ChangeDetectorRef) {}
  ngOnInit(): void {

  }
  goBack() {
    this.location.back()
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
