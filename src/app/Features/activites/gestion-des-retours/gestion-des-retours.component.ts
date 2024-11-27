import { ChangeDetectorRef, Component } from '@angular/core';
import { Customer } from 'src/domain/customer';
import { Location } from '@angular/common';

@Component({
  selector: 'app-gestion-des-retours',
  templateUrl: './gestion-des-retours.component.html',
  styleUrls: ['./gestion-des-retours.component.scss']
})
export class GestionDesRetoursComponent {
  public activeTab: string = 'suiviRdv';
  customers!: Customer[];
  loading: boolean = true;
  selected = [];
  rows: any = [];
  constructor(private cd: ChangeDetectorRef,private location: Location){}
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
