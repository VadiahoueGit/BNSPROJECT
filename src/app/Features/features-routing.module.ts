import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesComponent } from './features.component';
import { ParametreComponent } from './parametre/parametre.component';
import { CartographieComponent } from './cartographie/cartographie.component';
import { PartenairesComponent } from './partenaires/partenaires.component';

const routes: Routes = [
    { path: '', redirectTo: '/feature', pathMatch: 'full' },
    {
        path: 'feature', component: FeaturesComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },  // Redirection par défaut vers dashboard
            { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'parametre', loadChildren: () => import('./parametre/parametre.module').then(m => m.ParametreModule) },
            { path: 'datareference', loadChildren: () => import('./donnees-de-references/donnees-de-references.module').then(m => m.DonneesDeReferencesModule) },
            { path: 'partenaire', loadChildren: () => import('./partenaires/partenaires.module').then(m => m.PartenairesModule) },
            { path: 'activites', loadChildren: () => import('./activites/activites.module').then(m => m.ActivitesModule) },
            { path: 'finances', loadChildren: () => import('./finances/finances.module').then(m => m.FinancesModule) },
            { path: 'stocks', loadChildren: () => import('./stocks/stocks.module').then(m => m.StocksModule) },
            { path: 'achats', loadChildren: () => import('./achats/achats.module').then(m => m.AchatsModule) },
            { path: 'cartographie', component:CartographieComponent }

        ]
    },
    //   { path: 'parametre', loadChildren: () => import('./parametre/parametre.module').then(m => m.ParametreModule) },
    //   { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeaturesRoutingModule { }
