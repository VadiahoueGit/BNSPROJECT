import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StocksComponent } from './stocks.component';
import { InventaireStoksComponent } from './inventaire-stoks/inventaire-stoks.component';
import { EntreenStockComponent } from './entreen-stock/entreen-stock.component';
import { SortieDeStockComponent } from './sortie-de-stock/sortie-de-stock.component';
import { TransfertDeStockComponent } from './transfert-de-stock/transfert-de-stock.component';
import { VisualisationDeStockComponent } from './visualisation-de-stock/visualisation-de-stock.component';
import { AnalyseDeStockComponent } from './analyse-de-stock/analyse-de-stock.component';

const routes: Routes = [
  {path:'', component:StocksComponent},
  { path: 'entree-stocks', component: EntreenStockComponent },
  { path: 'sortie-stocks', component: SortieDeStockComponent },
  { path: 'transfert-stocks', component: TransfertDeStockComponent },
  { path: 'inventaire', component: InventaireStoksComponent },
  { path: 'visualisation-stocks', component: VisualisationDeStockComponent },
  { path: 'analyse-stocks', component: AnalyseDeStockComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StocksRoutingModule { }
