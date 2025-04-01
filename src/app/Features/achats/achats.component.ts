import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-achats',
  templateUrl: './achats.component.html',
  styleUrls: ['./achats.component.scss']
})

export class AchatsComponent {
  ListItems = [
    {
      image: 'assets/icon/supply-chain.png',
      title: 'Commande fournisseurs',
      url: 'feature/achats/commande-fournisseur',
    },
    {
      image: 'assets/icon/lading.png',
      title: 'Validation commande',
      url:'feature/achats/validation-commande',
    },
    {
      image: 'assets/icon/delivery-box.png',
      title: 'Réception marchandise',
       url:'feature/achats/reception-marchandise',
    },
    {
      image: 'assets/icon/gift.png',
      title: 'Entrée de gratuité',
      url:'feature/achats/entree-de-gratuite',
    },
    {
      image: 'assets/icon/history.png',
      title: 'Historique & gestion des retours',
      url: 'feature/achats/historique-de-gestion-retour',
    },

  ]
    constructor(private _router: Router) { }
    ngOnInit(): void {

    }
  displayItem(elt: any) {
    console.log(elt)
    this._router.navigate([elt.url])
  }
}
