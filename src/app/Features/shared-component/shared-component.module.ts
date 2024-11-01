import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { ToastrModule } from 'ngx-toastr';
import { TruncatePipe } from './Pipe/truncate.pipe';


@NgModule({
  declarations: [
    CardComponent,
    TruncatePipe
  ],
  imports: [
    CommonModule,
    ToastrModule.forRoot(),
  ],
  exports: [
    TruncatePipe
  ]
})
export class SharedComponentModule { }
