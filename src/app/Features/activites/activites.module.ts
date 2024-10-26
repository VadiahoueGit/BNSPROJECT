import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitesComponent } from './activites.component';
import { ActivitesRoutingModule } from './activites-routing.module';
import { VisitecomComponent } from './visitecom/visitecom.component';
import { GestionvisiteComponent } from './gestionvisite/gestionvisite.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  declarations: [
    ActivitesComponent,
    VisitecomComponent,
    GestionvisiteComponent
  ],
  imports: [
    CommonModule,
    ActivitesRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ]
})
export class ActivitesModule { }
