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
      image: 'assets/icon/article.png',
      title: 'Stocks',
      url: 'feature/stocks/groupe-stocks',
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
