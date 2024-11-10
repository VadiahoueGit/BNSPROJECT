import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../core/local-storage.service';
import { storage_keys } from './shared-component/utils';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {

  currentUrl: string;
  items = [
    { label: 'Dashboard', icon: 'fas fa-chart-line', url: 'feature/dashboard' },
    { label: 'Activités', icon: 'fas fa-truck-container', url: 'feature/activites' },
    { label: 'Cartographie', icon: 'fas fa-map', url: '/feature/cartographie' },
    { label: 'Rapports', icon: 'fas fa-file-chart-line', url: 'feature/rapport' },
    { label: 'Paramètres', icon: 'fas fa-cogs', url: 'feature/parametre' },
    { label: 'Achats', icon: 'fas fa-sack-dollar', url: 'feature/achat' },
    { label: 'Partenaires', icon: 'fas fa-handshake', url:'/feature/partenaire' },
    { label: 'Finances', icon: 'fas fa-sack-dollar', url: 'feature/finance' },
    { label: 'Stocks', icon: 'fas fa-warehouse-alt', url: 'feature/stocks' },
    // { label: 'Données de références', icon: 'fas fa-warehouse-alt', url: 'feature/datareference' }
  ];
  UserInfo:any
  selectedItem: number | null = null;
  constructor(private router: Router,private localstorage:LocalStorageService,) {
    this.currentUrl = this.router.url; // URL courante
  }
  ngOnInit(): void {
    this.UserInfo = this.localstorage.getItem(storage_keys.STOREUser);
    console.log(this.UserInfo)
    // if (this.currentUrl.includes('parametre')) {
    if (this.currentUrl.includes('/feature/dashboard') ){
      this.setActive(0)
    } else if (this.currentUrl.includes('/feature/activite')) {
      this.setActive(1)
    } else if (this.currentUrl.includes('/feature/cartographie')) {
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
    //  else if (this.currentUrl.includes('/feature/datareference')) {
    //   this.setActive(9)
    // } 
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
