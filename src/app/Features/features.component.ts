import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {

  currentUrl: string;
  items = [
    { label: 'Dashboard', icon: 'fas fa-chart-line', url: 'feature/dashboard' },
    { label: 'Activités', icon: 'fas fa-truck-container', url: 'feature/activite' },
    { label: 'Cartographie', icon: 'fas fa-map', url: 'carte' },
    { label: 'Rapports', icon: 'fas fa-file-chart-line', url: 'feature/rapport' },
    { label: 'Paramètres', icon: 'fas fa-cogs', url: 'feature/parametre' },
    { label: 'Achats', icon: 'fas fa-sack-dollar', url: 'feature/achat' },
    { label: 'Partenaires', icon: 'fas fa-handshake', url: 'feature/partenaire' },
    { label: 'Finances', icon: 'fas fa-sack-dollar', url: 'feature/finance' },
    { label: 'Stocks', icon: 'fas fa-warehouse-alt', url: 'feature/stocks' }
  ];
  
  selectedItem: number | null = null;
  constructor(private router: Router) {
    this.currentUrl = this.router.url; // URL courante
  }
  ngOnInit(): void {
    console.log(this.currentUrl)
    // if (this.currentUrl.includes('parametre')) {
    if (this.currentUrl.includes('/feature') ){
      this.setActive(0)
    } else if (this.currentUrl.includes('/feature/activite')) {
      this.setActive(1)
    } else if (this.currentUrl.includes('/feature/carte')) {
      this.setActive(2)
    } else if (this.currentUrl.includes('/feature/rapport')) {
      this.setActive(3)
    } else if (this.currentUrl.includes('/feature/parametre')) {
      this.setActive(4)
    }else if (this.currentUrl.includes('/feature/achat')) {
      this.setActive(5)
    } else if (this.currentUrl.includes('/feature/partenaire')) {
      this.setActive(6)
    }else if (this.currentUrl.includes('/feature/finance')) {
      this.setActive(7)
    } else if (this.currentUrl.includes('/feature/stocks')) {
      this.setActive(8)
    } 
  }

  setActive(index: number) {
    this.selectedItem = index;
  }

  navigate(url: string,index: number) {
    console.log(url)
    this.setActive(index)
    this.router.navigate([url]);
  }
}
