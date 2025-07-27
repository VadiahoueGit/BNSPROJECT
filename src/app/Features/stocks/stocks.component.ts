import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {hasPermission} from "../../utils/utils";

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
      perm:'stock_entree'
    },
    {
      image: 'assets/icon/stockout.png',
      title: 'Sortie de stock',
      url: 'feature/stocks/sortie-stocks',
      perm:'stock_sortie'
    },
    {
      image: 'assets/icon/transfert.png',
      title: 'Transfert de stock',
      url: 'feature/stocks/transfert-stocks',
      perm:'stock_transfert'
    },
    {
      image: 'assets/icon/inventaire.png',
      title: 'Inventaire',
      url: 'feature/stocks/inventaire',
      perm:'stock_inventaire'
    },
    {
      image: 'assets/icon/visual.png',
      title: 'Visualisation de stock',
      url: 'feature/stocks/visualisation-stocks',
      perm:'stock_visualisation'
    },
    {
      image: 'assets/icon/analytics.png',
      title: 'Analyse de stock',
      url: 'feature/stocks/analyse-stocks',
      perm:'stock_analyse'
    },
    {
      image: 'assets/icon/trade.png',
      title: 'Mouvements de stock',
      url: 'feature/stocks/mouvement-stocks',
      perm:'stock_mouvements'
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
