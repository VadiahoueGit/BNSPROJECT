import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private cd: ChangeDetectorRef, private location: Location,private router: Router) { }
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
