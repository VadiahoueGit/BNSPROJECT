import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-parametre',
  templateUrl: './parametre.component.html',
  styleUrls: ['./parametre.component.scss'],
})
export class ParametreComponent implements OnInit {
  ListItems = [
    {
      image: 'assets/icon/article.png',
      title: 'Articles & prix',
      url: 'feature/parametre/articles',
    },
    {
      image: 'assets/icon/vehicule.png',
      title: 'Vehicules',
      url: 'feature/parametre/logistique',
    },
    {
      image: 'assets/icon/users.png',
      title: 'Utilisateurs',
      url:'feature/parametre/users',
    },
    {
      image: 'assets/icon/seller.png',
      title: 'Commerciaux',
      url:'feature/parametre/commercial',
    },
    {
      image: 'assets/icon/localite.png',
      title: 'Localités',
      url: 'feature/datareference/localite',
    },
    {
      image: 'assets/icon/depot.png',
      title: 'Depots',
      url:'feature/datareference/depot',
    },
    {
      image: 'assets/icon/zone.png',
      title: 'Zone de livraison',
      url:'feature/datareference/zone-livraison',
    },
    {
      image: 'assets/icon/group.png',
      title: 'Groupe client',
       url:'feature/datareference/groupe-client',
    },
    {
      image: 'assets/icon/quest.png',
      title: 'Questions visite',
      url:'feature/parametre/questionnairevisite',
    },
    {
      image: 'assets/icon/article.png',
      title: 'Nom du prix',
      url:'feature/parametre/typeprix',
    },
    {
      image: 'assets/icon/casier.png',
      title: 'Plastique nu',
      url:'feature/datareference/plastique-nu',
    },
    {
      image: 'assets/icon/bouteille.png',
      title: 'Bouteille vide',
      url:'feature/datareference/bouteille-vide',
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
