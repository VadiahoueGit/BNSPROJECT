import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitesComponent } from './activites.component';
import { ActivitesRoutingModule } from './activites-routing.module';
import { VisitecomComponent } from './visitecom/visitecom.component';
import { GestionvisiteComponent } from './gestionvisite/gestionvisite.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { SuivivisiteComponent } from './suivivisite/suivivisite.component';

@NgModule({
  declarations: [
    ActivitesComponent,
    VisitecomComponent,
    GestionvisiteComponent,
    SuivivisiteComponent
  ],
  imports: [
    NgSelectModule,
    CommonModule,
    ActivitesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ActivitesModule { }
