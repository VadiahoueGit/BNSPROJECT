import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransporteurComponent } from '../Features/parametre/transporteur/transporteur.component';
import { AuthGuardService } from './auth-guard.service';
import { InterchangeTooltipPipe } from './interchange-tooltip.pipe';



@NgModule({
  declarations: [
    // TransporteurComponent


  ],
  imports: [
    CommonModule,
  ],
  exports: [
  ],
  providers: [
    AuthGuardService
  ]
})
export class CoreModule { }
