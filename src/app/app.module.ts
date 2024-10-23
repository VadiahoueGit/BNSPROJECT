import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './public/auth/auth.module';
import { GestionClientsModule } from './Features/gestion-clients/gestion-clients.module';
import { SharedComponentModule } from './Features/shared-component/shared-component.module';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService } from './core/config-service.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FeaturesModule } from './Features/features.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

export function initConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}
@NgModule({
  declarations: [
    AppComponent,
    
  ],
  imports: [
    FeaturesModule,
    AuthModule,
    SharedComponentModule,
    HttpClientModule ,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDatatableModule,
    BrowserAnimationsModule,
    NgxSpinnerModule.forRoot ( {  type : 'ball-scale-multiple'  } )
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [ConfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
