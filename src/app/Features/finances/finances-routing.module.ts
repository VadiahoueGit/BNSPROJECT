import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancesComponent } from './finances.component';
import { ComptabiliteComponent } from './comptabilite/comptabilite.component';

const routes: Routes = [
  { path: '', component: FinancesComponent },
  { path: 'comptabilite', component: ComptabiliteComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancesRoutingModule { }
