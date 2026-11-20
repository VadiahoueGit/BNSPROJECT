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
    {
      image: 'assets/icon/validation.png',
      title: 'Validations',
      url: 'feature/finances/validation',
    },
    {
      image: 'assets/icon/caisse.png',
      title: 'Caisse',
      url: 'feature/finances/caisse',
    },
    {
      image: 'assets/icon/compta.png',
      title: 'Paiements BO',
      url: 'feature/finances/paiement-bo',
    },
    {
      image: 'assets/icon/currency.png',
      title: 'Rapprochement SAP',
      url: 'feature/finances/sap-rapprochement',
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
