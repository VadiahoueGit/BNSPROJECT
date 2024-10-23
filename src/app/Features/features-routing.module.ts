import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesComponent } from './features.component';
import { ParametreComponent } from './parametre/parametre.component';

const routes: Routes = [
    { path: '', redirectTo: '/feature', pathMatch: 'full' },
    {
        path: 'feature', component: FeaturesComponent,
        children: [
            { path: '', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'parametre', loadChildren: () => import('./parametre/parametre.module').then(m => m.ParametreModule) }
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
