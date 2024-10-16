import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./public/auth/auth.module').then(m => m.AuthModule) },
  // { path: 'clients', loadChildren: () => import('./Features/gestion-clients/gestion-clients.module').then(m => m.GestionClientsModule) },
  { path: 'feature', loadChildren: () => import('./Features/features.module').then(m => m.FeaturesModule) },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
