import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StocksComponent } from './stocks.component';
import { GroupeStocksComponent } from './groupe-stocks/groupe-stocks.component';

const routes: Routes = [
  {path:'', component:StocksComponent},
  { path: 'groupe-stocks', component: GroupeStocksComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StocksRoutingModule { }
