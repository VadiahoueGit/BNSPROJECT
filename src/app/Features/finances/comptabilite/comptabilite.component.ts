import { ChangeDetectorRef, Component } from '@angular/core';
import { Customer } from 'src/domain/customer';
import { Location } from '@angular/common';

@Component({
  selector: 'app-comptabilite',
  templateUrl: './comptabilite.component.html',
  styleUrls: ['./comptabilite.component.scss']
})
export class ComptabiliteComponent {
  public activeTab: string = 'suiviCompte';
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
