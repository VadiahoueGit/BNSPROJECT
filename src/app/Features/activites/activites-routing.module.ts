import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitesComponent } from './activites.component';
import { VisitecomComponent } from './visitecom/visitecom.component';
import { VentechineComponent } from './ventechine/ventechine.component';
import { CommandesClientsComponent } from './commandes-clients/commandes-clients.component';
import { CommandeGratuiteComponent } from './commande-gratuite/commande-gratuite.component';
import { GestionDesRetoursComponent } from './gestion-des-retours/gestion-des-retours.component';

const routes: Routes = [
    { path: '', component:ActivitesComponent },
    { path: 'visitecom', component: VisitecomComponent },
    { path: 'ventechine', component: VentechineComponent },
    { path: 'commandes-clients', component: CommandesClientsComponent },
    { path: 'commandes-gratuites', component: CommandeGratuiteComponent },
    { path: 'gestion-retour', component: GestionDesRetoursComponent },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ActivitesRoutingModule { }
