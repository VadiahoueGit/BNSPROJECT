import { ChangeDetectorRef, Component } from '@angular/core';
import { Customer } from 'src/domain/customer';

@Component({
  selector: 'app-visitecom',
  templateUrl: './visitecom.component.html',
  styleUrls: ['./visitecom.component.scss']
})
export class VisitecomComponent {
  public activeTab: string = 'svisite';
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
