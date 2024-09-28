import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListClientsComponent } from './list-clients/list-clients.component';
import { GestionClientRoutingModule } from './gestion-client-routing.module';



@NgModule({
  declarations: [
    ListClientsComponent
  ],
  imports: [
    CommonModule,
    GestionClientRoutingModule
  ]
})
export class GestionClientsModule { }
