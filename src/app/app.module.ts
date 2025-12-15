import {
  APP_INITIALIZER,
  CUSTOM_ELEMENTS_SCHEMA,
  LOCALE_ID,
  NgModule,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './public/auth/auth.module';
import { GestionClientsModule } from './Features/gestion-clients/gestion-clients.module';
import { SharedComponentModule } from './Features/shared-component/shared-component.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ConfigService } from './core/config-service.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FeaturesModule } from './Features/features.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { MessageService } from 'primeng/api';
import { AuthGuardService } from './core/auth-guard.service';
import { LocalStorageService } from './core/local-storage.service';
import { AuthInterceptor } from './core/auth.interceptor';
import { GoogleMapsModule } from '@angular/google-maps';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {ConfidentialityComponent} from "./Features/confidentiality/confidentiality.component";
registerLocaleData(localeFr);
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.default,
};
export function initConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}
@NgModule({
  declarations: [AppComponent,ConfidentialityComponent],
  imports: [
    NgWizardModule.forRoot(ngWizardConfig),
    AuthModule,
    GoogleMapsModule,
    FeaturesModule,
    SharedComponentModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDatatableModule,
    BrowserAnimationsModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    LocalStorageService,
    AuthGuardService,
    MessageService,

    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [ConfigService],

      multi: true,
    },
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR',
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
