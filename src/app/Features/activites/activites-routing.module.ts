import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitesComponent } from './activites.component';
import { VisitecomComponent } from './visitecom/visitecom.component';
import { VentechineComponent } from './ventechine/ventechine.component';
import { CommandesClientsComponent } from './commandes-clients/commandes-clients.component';
import { CommandeGratuiteComponent } from './commande-gratuite/commande-gratuite.component';
import { GestionDesRetoursComponent } from './gestion-des-retours/gestion-des-retours.component';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { LivraisonComponent } from './livraison/livraison.component';
import { FacturationComponent } from './facturation/facturation.component';
import {ProformatComponent} from "./proformat/proformat.component";

const routes: Routes = [
    { path: '', component:ActivitesComponent },
    { path: 'visitecom', component: VisitecomComponent },
    { path: 'ventechine', component: VentechineComponent },
    { path: 'livraison', component: LivraisonComponent },
    { path: 'commandes-clients', component: CommandesClientsComponent, resolve:{UtilisateurResolveService}},
    { path: 'commandes-gratuites', component: CommandeGratuiteComponent },
    { path: 'gestion-retour', component: GestionDesRetoursComponent },
    { path: 'facturation', component: FacturationComponent },
  { path: 'proformat', component: ProformatComponent },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ActivitesRoutingModule { }
