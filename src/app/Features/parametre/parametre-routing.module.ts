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
  { path: 'commercial', component: CommercialComponent },
  { path: 'typeprix', component: ListPrixComponent, resolve:{ArticleServiceService} },
  { path: 'moyen-paiement', component: MoyenDePaiementComponent, resolve:{ArticleServiceService} },

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
