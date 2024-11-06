import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardModule } from './dashboard/dashboard.module';
import { FeaturesComponent } from './features.component';
import { CommonModule } from '@angular/common';
import { FeaturesRoutingModule } from './features-routing.module';
import { ParametreComponent } from './parametre/parametre.component';
import { ParametreModule } from './parametre/parametre.module';
import { CustomerService } from 'src/service/customerservice';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CartographieComponent } from './cartographie/cartographie.component';
import { RapportComponent } from './rapport/rapport.component';
import { AchatsComponent } from './achats/achats.component';
import { PartenairesComponent } from './partenaires/partenaires.component';
import { PartenairesModule } from './partenaires/partenaires.module';

@NgModule({
  declarations: [
  
   CartographieComponent,
   RapportComponent,
   AchatsComponent,
   FeaturesComponent,
  ],
  imports: [
    FeaturesRoutingModule,
    PartenairesModule,
    // ParametreModule,
   
    DashboardModule,
    CommonModule,
    NgxDatatableModule

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [CustomerService]
})
export class FeaturesModule { }
