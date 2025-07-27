import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './core/auth-guard.service';
import {ConfidentialityComponent} from "./Features/confidentiality/confidentiality.component";

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'confidentialite', component:ConfidentialityComponent },
  { path: 'auth', loadChildren: () => import('./public/auth/auth.module').then(m => m.AuthModule) },
  { path: 'feature', loadChildren: () => import('./Features/features.module').then(m => m.FeaturesModule),canActivate: [AuthGuardService] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
