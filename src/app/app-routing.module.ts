import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./public/auth/auth.module').then(m => m.AuthModule) },
  { path: 'clients', loadChildren: () => import('./Features/gestion-clients/gestion-clients.module').then(m => m.GestionClientsModule) },
  { path: 'dashboard', loadChildren: () => import('./Features/dashboard/dashboard.module').then(m => m.DashboardModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
