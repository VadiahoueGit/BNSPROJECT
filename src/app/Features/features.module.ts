import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardModule } from './dashboard/dashboard.module';
import { FeaturesComponent } from './features.component';
import { CommonModule } from '@angular/common';
import { FeaturesRoutingModule } from './features-routing.module';
import { ParametreComponent } from './parametre/parametre.component';
import { ParametreModule } from './parametre/parametre.module';
import { CustomerService } from 'src/service/customerservice';

@NgModule({
  declarations: [
   FeaturesComponent
  ],
  imports: [
    // ParametreModule,
    FeaturesRoutingModule,
    DashboardModule,
    CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [CustomerService]
})
export class FeaturesModule { }
