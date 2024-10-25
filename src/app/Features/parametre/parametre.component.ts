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
      url:'feature/parametre/logistique',
    },
    {
      image: 'assets/icon/users.png',
      title: 'Utilisateurs',
      // url:'feature/parametre/logistique',
    },
    {
      image: 'assets/icon/seller.png',
      title: 'Commerciaux',
      // url:'feature/parametre/logistique',
    },
    {
      image: 'assets/icon/client.png',
      title: 'Clients',
      // url:'feature/parametre/logistique',
    }
  ]
constructor(private _router: Router){}
  ngOnInit(): void {
    
  }
  displayItem(elt:any){
console.log(elt)
this._router.navigate([elt.url])
  }
}
