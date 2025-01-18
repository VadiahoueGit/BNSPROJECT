import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-finances',
  templateUrl: './finances.component.html',
  styleUrls: ['./finances.component.scss']
})
export class FinancesComponent {
  ListItems = [
    {
      image: 'assets/icon/compta.png',
      title: 'Comptablité',
      url: 'feature/finances/comptabilite',
    },
    // {
    //   image: 'assets/icon/store.png',
    //   title: 'Revendeurs',
    //   url: 'feature/partenaire/revendeur',
    // }

  ]
  constructor(private _router: Router) { }
  ngOnInit(): void {

  }
  displayItem(elt: any) {
    console.log(elt)
    this._router.navigate([elt.url])
  }
}
