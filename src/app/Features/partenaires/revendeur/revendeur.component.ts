import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-revendeur',
  templateUrl: './revendeur.component.html',
  styleUrls: ['./revendeur.component.scss']
})
export class RevendeurComponent {
  constructor(private cd: ChangeDetectorRef, private location: Location) {}

  goBack() {
    this.location.back()
  }
}
