import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonneesDeReferencesRoutingModule } from './donnees-de-references-routing.module';
import { LocaliteComponent } from './localite/localite.component';
import { DepotComponent } from './depot/depot.component';
import { ZoneLivraisonComponent } from './zone-livraison/zone-livraison.component';
import { GroupeClientComponent } from './groupe-client/groupe-client.component';
import { DatareferencesComponent } from './datareferences.component';


@NgModule({
  declarations: [
    LocaliteComponent,
    DepotComponent,
    ZoneLivraisonComponent,
    GroupeClientComponent,
    DatareferencesComponent
  ],
  imports: [
    CommonModule,
    DonneesDeReferencesRoutingModule
  ]
})
export class DonneesDeReferencesModule { }
