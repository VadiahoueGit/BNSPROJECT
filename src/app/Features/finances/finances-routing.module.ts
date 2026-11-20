import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancesComponent } from './finances.component';
import { ComptabiliteComponent } from './comptabilite/comptabilite.component';
import { ValidationComponent } from './validation/validation/validation.component';
import {CaisseComponent} from "./caisse/caisse.component";
import { PaiementBoComponent } from './paiement-bo/paiement-bo.component';
import { SapRapprochementComponent } from './sap-rapprochement/sap-rapprochement.component';

const routes: Routes = [
  { path: '', component: FinancesComponent },
  { path: 'comptabilite', component: ComptabiliteComponent },
  { path: 'validation', component: ValidationComponent },
  { path: 'caisse', component: CaisseComponent },
  { path: 'paiement-bo', component: PaiementBoComponent },
  { path: 'sap-rapprochement', component: SapRapprochementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancesRoutingModule { }
