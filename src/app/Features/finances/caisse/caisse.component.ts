import { ChangeDetectorRef, Component } from '@angular/core';
import { Customer } from 'src/domain/customer';
import { Location } from '@angular/common';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-caisse',
  templateUrl: './caisse.component.html',
  styleUrls: ['./caisse.component.scss']
})

export class CaisseComponent {
  // public activeTab: string = 'brouillard';
  public activeTab: string = 'comptes';
  constructor(private location: Location,private cd: ChangeDetectorRef) {}
  goBack() {
    this.location.back()
  }
  activeElement(elt: string) {
    this.activeTab = elt;
  }
}
