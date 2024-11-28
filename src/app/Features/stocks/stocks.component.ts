import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.scss']
})
export class StocksComponent {
  ListItems = [
    {
      image: 'assets/icon/stockin.png',
      title: 'Entrée en stock',
      url: 'feature/stocks/entree-stocks',
    },
    {
      image: 'assets/icon/stockout.png',
      title: 'Sortie de stock',
      url: 'feature/stocks/sortie-stocks',
    },
    {
      image: 'assets/icon/transfert.png',
      title: 'Transfert de stock',
      url: 'feature/stocks/transfert-stocks',
    },
    {
      image: 'assets/icon/inventaire.png',
      title: 'Inventaire',
      url: 'feature/stocks/inventaire',
    },
    {
      image: 'assets/icon/visual.png',
      title: 'Visualisation de stock',
      url: 'feature/stocks/visualisation-stocks',
    },
    {
      image: 'assets/icon/analytics.png',
      title: 'Analyse de stock',
      url: 'feature/stocks/analyse-stocks',
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
