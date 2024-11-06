import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientosrComponent } from './clientosr/clientosr.component';
import { RevendeurComponent } from './revendeur/revendeur.component';
import { PartenairesRoutingModule } from './partenaires-routing.module';
import { PartenairesComponent } from './partenaires.component';



@NgModule({
  declarations: [
    PartenairesComponent,
    ClientosrComponent,
    RevendeurComponent
  ],
  imports: [
    PartenairesRoutingModule,
    CommonModule,
  ]
})
export class PartenairesModule { }
