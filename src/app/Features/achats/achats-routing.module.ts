import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AchatsComponent } from './achats.component';
import { CommandeFournisseursComponent } from './commande-fournisseurs/commande-fournisseurs.component';
import { EntreeGratuiteComponent } from './entree-gratuite/entree-gratuite.component';
import { HistoiqueGestionRetoursComponent } from './histoique-gestion-retours/histoique-gestion-retours.component';
import { ReceptionMarchandiseComponent } from './reception-marchandise/reception-marchandise.component';
import { ValidationCommandeComponent } from './validation-commande/validation-commande.component';

const routes: Routes = [
    { path: '', component:AchatsComponent },
    { path: 'commande-fournisseur', component:CommandeFournisseursComponent },
    { path: 'entree-de-gratuite', component:EntreeGratuiteComponent },
    { path: 'historique-de-gestion-retour', component:HistoiqueGestionRetoursComponent },
    { path: 'reception-marchandise', component:ReceptionMarchandiseComponent },
    { path: 'validation-commande', component:ValidationCommandeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AchatsRoutingModule { }
