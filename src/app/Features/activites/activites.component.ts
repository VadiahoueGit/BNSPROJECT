import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activites',
  templateUrl: './activites.component.html',
  styleUrls: ['./activites.component.scss']
})
export class ActivitesComponent implements OnInit{

  ListItems = [
    {
      image: 'assets/icon/proforma.png',
      title: 'Proforma',
      // url: 'feature/activites/articles',
    },
    {
      image: 'assets/icon/commande.png',
      title: 'Commandes clients',
       url:'feature/activites/commandes-clients',
    },
    {
      image: 'assets/icon/commandefree.png',
      title: 'Commandes gratuite',
      url:'feature/activites/commandes-gratuites',
    },
    {
      image: 'assets/icon/delivery.png',
      title: 'Livraisons',
      url: 'feature/activites/livraison',
    },
    {
      image: 'assets/icon/retour.png',
      title: 'Gestion des retours',
      url:'feature/activites/gestion-retour',
    } ,
    {
      image: 'assets/icon/facture.png',
      title: 'Facturation',
      // url:'feature/activites/logistique',
    },
    {
      image: 'assets/icon/vente.png',
      title: 'Ventes chine',
      url:'feature/activites/ventechine',
    },
    {
      image: 'assets/icon/visitecom.png',
      title: 'Visites commerciales',
      url: 'feature/activites/visitecom',
    }
  ]
  constructor(private _router: Router) { }
  ngOnInit(): void {

  }
  displayItem(elt: any) {
    console.log(elt)
    this._router.navigate([elt.url])
  }
}
