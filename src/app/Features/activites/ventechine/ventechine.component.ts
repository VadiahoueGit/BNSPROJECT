import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-ventechine',
  templateUrl: './ventechine.component.html',
  styleUrls: ['./ventechine.component.scss']
})
export class VentechineComponent {
  public activeTab: string = 'ventechine';
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
