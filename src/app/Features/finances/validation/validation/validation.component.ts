import { ChangeDetectorRef, Component } from '@angular/core';
import { Customer } from 'src/domain/customer';
import { Location } from '@angular/common';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss']
})
export class ValidationComponent {
  public activeTab: string = 'validationVenteChine';
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
