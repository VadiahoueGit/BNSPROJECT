import { ChangeDetectorRef, Component } from '@angular/core';
import { Customer } from 'src/domain/customer';
import { Location } from '@angular/common';

@Component({
  selector: 'app-entree-gratuite',
  templateUrl: './entree-gratuite.component.html',
  styleUrls: ['./entree-gratuite.component.scss'],
})
export class EntreeGratuiteComponent {
  public activeTab: string = 'saisiecommande';
  customers!: Customer[];
  loading: boolean = true;
  selected = [];
  rows: any = [];
  constructor(private cd: ChangeDetectorRef, private location: Location) {}
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
