import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {DndModule} from 'ngx-drag-drop';
import {DashboardModule} from './dashboard/dashboard.module';
import {FeaturesComponent} from './features.component';
import {CommonModule} from '@angular/common';
import {FeaturesRoutingModule} from './features-routing.module';
import {ParametreComponent} from './parametre/parametre.component';
import {ParametreModule} from './parametre/parametre.module';
import {CustomerService} from 'src/service/customerservice';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {CartographieComponent} from './cartographie/cartographie.component';
import {RapportComponent} from './rapport/rapport.component';
import {PartenairesComponent} from './partenaires/partenaires.component';
import {PartenairesModule} from './partenaires/partenaires.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GoogleMapsModule} from "@angular/google-maps";
import {AnnonceComponent} from './annonce/annonce.component';
import {NgxFileDropModule} from "ngx-file-drop";

@NgModule({
  declarations: [

    CartographieComponent,
    RapportComponent,
    FeaturesComponent,
    AnnonceComponent,
  ],
  imports: [
    FeaturesRoutingModule,
    PartenairesModule,
    // ParametreModule,
    NgxFileDropModule,
    ReactiveFormsModule,
    FormsModule,
    DashboardModule,
    CommonModule,
    NgxDatatableModule,
    GoogleMapsModule

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [CustomerService]
})
export class FeaturesModule {
}
