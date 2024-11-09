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
      // url:'feature/parametre/logistique',
    },
    {
      image: 'assets/icon/localite.png',
      title: 'Localités',
      url: 'feature/parametre/logistique',
    },
    {
      image: 'assets/icon/depot.png',
      title: 'Depots',
      url:'feature/parametre/users',
    },
    {
      image: 'assets/icon/zone.png',
      title: 'Zone de livraison',
      // url:'feature/parametre/logistique',
    },
    {
      image: 'assets/icon/group.png',
      title: 'Groupe client',
      // url:'feature/parametre/logistique',
    },
    {
      image: 'assets/icon/quest.png',
      title: 'Questions visite',
      url:'feature/parametre/questionnairevisite',
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
