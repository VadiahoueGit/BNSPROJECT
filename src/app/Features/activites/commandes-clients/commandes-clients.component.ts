import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Customer } from 'src/domain/customer';


@Component({
  selector: 'app-commandes-clients',
  templateUrl: './commandes-clients.component.html',
  styleUrls: ['./commandes-clients.component.scss']
})
export class CommandesClientsComponent {
  public activeTab: string = 'saisiecommande';
  customers!: Customer[];
  loading: boolean = true;
  selected = [];
  rows: any = [];
  constructor(private cd: ChangeDetectorRef){}
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
