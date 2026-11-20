import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParametreComponent } from './parametre.component';
import { ArticlesEtPrixComponent } from './articles-et-prix/articles-et-prix.component';
import { LogistiqueComponent } from './logistique/logistique.component';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { LogistiqueService } from 'src/app/core/logistique.service';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { QuestionnaireVisiteComponent } from './questionnaire-visite/questionnaire-visite.component';
import { CommercialComponent } from './commercial/commercial.component';
import { ListPrixComponent } from './list-prix/list-prix.component';
import { MoyenDePaiementComponent } from './moyen-de-paiement/moyen-de-paiement.component';
import { BanqueComponent } from './banque/banque.component';
import { CompteComponent } from './compte/compte.component';
import { TypeCompteComponent } from './type-compte/type-compte.component';
import { DevisesComponent } from './devises/devises.component';
import { ReglePaletteComponent } from './regle-palette/regle-palette.component';
import { InfosEntrepriseComponent } from './infos-entreprise/infos-entreprise.component';
import { SapConfigComponent } from './sap-config/sap-config.component';
const routes: Routes = [
  { path: '', component: ParametreComponent },
  {
    path: 'articles',
    component: ArticlesEtPrixComponent,
    resolve: {
      ArticleServiceService,
    },
  },
  { path: 'logistique', component: LogistiqueComponent },
  { path: 'devise', component: DevisesComponent },
  { path: 'commercial', component: CommercialComponent },
  { path: 'typeprix', component: ListPrixComponent, resolve:{ArticleServiceService} },
  { path: 'moyen-paiement', component: MoyenDePaiementComponent, resolve:{ArticleServiceService} },
  { path: 'banques', component: BanqueComponent },
  { path: 'comptes', component: CompteComponent },
  { path: 'type-comptes', component: TypeCompteComponent },

  { path: 'regle-palette', component: ReglePaletteComponent },
  { path: 'infos-entreprise', component: InfosEntrepriseComponent },
  { path: 'sap-config', component: SapConfigComponent },
  { path: 'questionnairevisite', component: QuestionnaireVisiteComponent },
  {
    path: 'users',
    component: UtilisateursComponent,
    resolve: {
      UtilisateurResolveService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParametreRoutingModule {}
