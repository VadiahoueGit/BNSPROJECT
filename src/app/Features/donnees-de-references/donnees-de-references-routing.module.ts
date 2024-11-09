import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatareferencesComponent } from './datareferences.component';
import { DepotComponent } from './depot/depot.component';
import { LocaliteComponent } from './localite/localite.component';
import { GroupeClientComponent } from './groupe-client/groupe-client.component';
import { ZoneLivraisonComponent } from './zone-livraison/zone-livraison.component';

const routes: Routes = [
  { path: '', component: DatareferencesComponent },
  { path: 'depot', component: DepotComponent },
  { path: 'localite', component: LocaliteComponent },
  { path: 'groupe-client', component: GroupeClientComponent },
  { path: 'zone-livraison', component: ZoneLivraisonComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DonneesDeReferencesRoutingModule { }
