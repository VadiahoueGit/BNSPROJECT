import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitesComponent } from './activites.component';
import { VisitecomComponent } from './visitecom/visitecom.component';
import { VentechineComponent } from './ventechine/ventechine.component';

const routes: Routes = [
    { path: '', component:ActivitesComponent },
    { path: 'visitecom', component: VisitecomComponent },
    { path: 'ventechine', component: VentechineComponent },
    //   { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ActivitesRoutingModule { }
