import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {hasPermission} from "../../utils/utils";

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
      perm:'achat_commande_fournisseur'
    },
    {
      image: 'assets/icon/delivery-box.png',
      title: 'Réception marchandise',
       url:'feature/achats/reception-marchandise',
      perm:'achat_reception_marchandises'
    },
    {
      image: 'assets/icon/gift.png',
      title: 'Entrée de gratuité',
      url:'feature/achats/entree-de-gratuite',
      perm:'achat_entree_gratuite'
    },

  ]
    constructor(private _router: Router) { }
    ngOnInit(): void {

    }
  displayItem(elt: any) {
    console.log(elt)
    this._router.navigate([elt.url])
  }

  protected readonly hasPermission = hasPermission;
}
