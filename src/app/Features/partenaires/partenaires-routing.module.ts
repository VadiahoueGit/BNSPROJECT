import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartenairesComponent } from './partenaires.component';
import { ClientosrComponent } from './clientosr/clientosr.component';
import { RevendeurComponent } from './revendeur/revendeur.component';


const routes: Routes = [
    { path: '', redirectTo: '/partenaire', pathMatch: 'full' },
    {
        path: 'partenaire', component: PartenairesComponent,
        children: [
            { path: 'clientosr', component: ClientosrComponent },
            { path: 'revendeur', component: RevendeurComponent }
        ]
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PartenairesRoutingModule { }
