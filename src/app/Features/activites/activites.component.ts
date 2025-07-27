import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {hasPermission} from "../../utils/utils";

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
      url: 'feature/activites/proformat',
      perm:'activites_proforma'
    },
    {
      image: 'assets/icon/facture.png',
      title: 'Facturation',
      url:'feature/activites/facturation',
      perm:'activites_facturation'
    },
    {
      image: 'assets/icon/commande.png',
      title: 'Commandes clients',
       url:'feature/activites/commandes-clients',
      perm:'activites_commandes_clients'
    },
    {
      image: 'assets/icon/commandefree.png',
      title: 'Commandes gratuite',
      url:'feature/activites/commandes-gratuites',
      perm:'activites_commandes_gratuite'
    },
    {
      image: 'assets/icon/delivery.png',
      title: 'Livraisons',
      url: 'feature/activites/livraison',
      perm:'activites_livraisons'
    },
    {
      image: 'assets/icon/retour.png',
      title: 'Gestion des retours',
      url:'feature/activites/gestion-retour',
      perm:'activites_retours'
    } ,
    {
      image: 'assets/icon/vente.png',
      title: 'Ventes chine',
      url:'feature/activites/ventechine',
      perm:'activites_ventes_chine'
    },
    {
      image: 'assets/icon/visitecom.png',
      title: 'Visites commerciales',
      url: 'feature/activites/visitecom',
      perm:'activites_visites'
    }
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
