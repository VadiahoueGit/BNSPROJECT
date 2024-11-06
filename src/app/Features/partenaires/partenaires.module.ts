import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientosrComponent } from './clientosr/clientosr.component';
import { RevendeurComponent } from './revendeur/revendeur.component';
import { PartenairesRoutingModule } from './partenaires-routing.module';
import { PartenairesComponent } from './partenaires.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableModule } from 'primeng/table';



@NgModule({
  declarations: [
    PartenairesComponent,
    ClientosrComponent,
    RevendeurComponent
  ],
  imports: [
   
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    PartenairesRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PartenairesModule { }
