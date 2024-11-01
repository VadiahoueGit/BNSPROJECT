import { ChangeDetectorRef, Component ,AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent  {
  public activeTab: string = 'profilutilisateur';
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
