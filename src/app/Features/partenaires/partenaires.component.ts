import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partenaires',
  templateUrl: './partenaires.component.html',
  styleUrls: ['./partenaires.component.scss']
})
export class PartenairesComponent {
  ListItems = [
    {
      image: 'assets/icon/prospect.png',
      title: 'Clients OsR',
      url: 'feature/partenaire/clientosr',
    },
    {
      image: 'assets/icon/store.png',
      title: 'Revendeurs',
      url: 'feature/partenaire/revendeur',
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
