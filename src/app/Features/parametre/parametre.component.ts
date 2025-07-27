import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import {hasPermission} from "../../utils/utils";

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
      perm:'param_articles_prix'
    },
    {
      image: 'assets/icon/vehicule.png',
      title: 'Vehicules',
      url: 'feature/parametre/logistique',
      perm:'param_vehicules'
    },
    {
      image: 'assets/icon/users.png',
      title: 'Utilisateurs',
      url:'feature/parametre/users',
      perm:'param_utilisateurs'
    },
    {
      image: 'assets/icon/seller.png',
      title: 'Commerciaux',
      url:'feature/parametre/commercial',
      perm:'param_commerciaux'
    },
    {
      image: 'assets/icon/localite.png',
      title: 'Localités',
      url: 'feature/datareference/localite',
      perm:'param_localites'
    },
    {
      image: 'assets/icon/depot.png',
      title: 'Depots',
      url:'feature/datareference/depot',
      perm:'param_depots'
    },
    {
      image: 'assets/icon/zone.png',
      title: 'Zone de livraison',
      url:'feature/datareference/zone-livraison',
      perm:'param_zone_livraison'
    },
    {
      image: 'assets/icon/group.png',
      title: 'Groupe client',
       url:'feature/datareference/groupe-client',
      perm:'param_groupe_client'
    },
    {
      image: 'assets/icon/quest.png',
      title: 'Questions visite',
      url:'feature/parametre/questionnairevisite',
      perm:'param_questions_visite'
    },
    {
      image: 'assets/icon/article.png',
      title: 'Nom du prix',
      url:'feature/parametre/typeprix',
      perm:'param_nom_prix'
    },
    {
      image: 'assets/icon/wallet.png',
      title: 'Moyen de paiement',
      url:'feature/parametre/moyen-paiement',
      perm:'param_moyen_paiement'
    },
    {
      image: 'assets/icon/casier.png',
      title: 'Plastique nu',
      url:'feature/datareference/plastique-nu',
      perm:'param_plastique_nu'
    },
    {
      image: 'assets/icon/bouteille.png',
      title: 'Bouteille vide',
      url:'feature/datareference/bouteille-vide',
      perm:'param_bouteille_vide'
    },
    {
      image: 'assets/icon/currency.png',
      title: 'Devises',
      url:'feature/parametre/devise',
      perm:'param_devises'
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
