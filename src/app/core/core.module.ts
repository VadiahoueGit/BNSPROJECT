import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransporteurComponent } from '../Features/parametre/transporteur/transporteur.component';
import { AuthGuardService } from './auth-guard.service';



@NgModule({
  declarations: [
    // TransporteurComponent
  ],
  imports: [
    CommonModule,
  ],
  providers:[
    AuthGuardService
  ]
})
export class CoreModule { }
