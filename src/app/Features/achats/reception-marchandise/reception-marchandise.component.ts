import { ChangeDetectorRef, Component } from '@angular/core';
import { Customer } from 'src/domain/customer';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reception-marchandise',
  templateUrl: './reception-marchandise.component.html',
  styleUrls: ['./reception-marchandise.component.scss']
})
export class ReceptionMarchandiseComponent {
  public activeTab: string = 'saisiecommande';
  customers!: Customer[];
  loading: boolean = true;
  selected = [];
  rows: any = [];
  constructor(private location: Location) {}
  ngOnInit(): void {}
  goBack() {
    this.location.back();
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
