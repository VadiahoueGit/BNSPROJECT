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
      image: 'assets/icon/proforma.png',
      title: 'Commande fournisseurs',
      url: 'feature/achats/commande-fournisseur',
    },
    {
      image: 'assets/icon/facture.png',
      title: 'Validation commande',
      url:'feature/achats/validation-commande',
    },
    {
      image: 'assets/icon/commande.png',
      title: 'Réception marchandise',
       url:'feature/achats/reception-marchandise',
    },
    {
      image: 'assets/icon/commandefree.png',
      title: 'Entrée de gratuité',
      url:'feature/achats/entree-de-gratuite',
    },
    {
      image: 'assets/icon/delivery.png',
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
