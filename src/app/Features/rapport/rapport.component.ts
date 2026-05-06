import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CATEGORIES_RAPPORT, CategorieRapport, RAPPORTS, RapportConfig } from './rapport-config';

@Component({
  selector: 'app-rapport',
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.scss']
})
export class RapportComponent implements OnInit {

  categories = CATEGORIES_RAPPORT;
  recherche = '';

  ngOnInit(): void {}

  constructor(private router: Router) {}

  getRapportsParCategorie(categorieId: string): RapportConfig[] {
    return RAPPORTS.filter(r =>
      r.categorie === categorieId &&
      (!this.recherche || r.titre.toLowerCase().includes(this.recherche.toLowerCase()))
    );
  }

  get categoriesVisibles(): CategorieRapport[] {
    if (!this.recherche) return this.categories;
    return this.categories.filter(c => this.getRapportsParCategorie(c.id).length > 0);
  }

  get totalRapports(): number {
    return RAPPORTS.length;
  }

  ouvrirRapport(rapport: RapportConfig): void {
    this.router.navigate(['/feature/rapport/viewer', rapport.id]);
  }
}
