import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-datareferences',
  templateUrl: './datareferences.component.html',
  styleUrls: ['./datareferences.component.scss']
})
export class DatareferencesComponent {
  ListItems = [
    {
      image: 'assets/icon/article.png',
      title: 'Dépots',
      url: 'feature/datareference/depot',
    },
    {
      image: 'assets/icon/article.png',
      title: 'Groupes clients',
      url: 'feature/datareference/groupe-client',
    },
    {
      image: 'assets/icon/article.png',
      title: 'Localités',
      url:'feature/datareference/localite',
    },
    {
      image: 'assets/icon/article.png',
      title: 'Zone de livraisons',
      url:'feature/datareference/zone-livraison',
    }
  ]
  constructor (private _router: Router){}
  displayItem(elt: any) {
    console.log(elt)
    this._router.navigate([elt.url])
  }
}
