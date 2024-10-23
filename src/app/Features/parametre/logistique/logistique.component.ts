import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-logistique',
  templateUrl: './logistique.component.html',
  styleUrls: ['./logistique.component.scss']
})
export class LogistiqueComponent {
  public activeTab: string = 'transporteurs';
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
