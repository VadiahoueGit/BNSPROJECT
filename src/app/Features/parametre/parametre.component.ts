import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-parametre',
  templateUrl: './parametre.component.html',
  styleUrls: ['./parametre.component.scss']
})
export class ParametreComponent implements OnInit {
  ListItems = [
    {
      image: 'assets/image/image.jpeg',
      title: 'Articles & prix',
      url:'feature/parametre/articles'
    },
    {
      image: 'assets/image/image.jpeg',
      title: 'Vehicules',
      url:''
    },
    {
      image: 'assets/image/image.jpeg',
      title: 'Utilisateurs',
      url:''
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
