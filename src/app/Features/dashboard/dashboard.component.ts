import {Component, OnInit} from '@angular/core';
import {LegendPosition} from '@swimlane/ngx-charts';
import {Color, ScaleType} from '@swimlane/ngx-charts';
import {Router} from '@angular/router';
import {CoreServiceService} from "../../core/core-service.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  articles: any[] =[];
  articlesTop: any[] =[];
  multi: any[] = []
  view: [number, number] = [500, 400];
  legend: boolean = true;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;

  showXAxisLabel: boolean = true;
  yAxisLabel: string = 'Produits vendus';
  showYAxisLabel: boolean = true;
  xAxisLabel = 'Casiers';

  // options
  legendTitle: string = 'Best seller TOP 10';
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition = LegendPosition.Below;
  colorScheme: any = {
    domain: ['#A3D9A5', '#F9C6C9', '#FFE5A5', '#B5D3F2', '#D9BDE2', '#C1ECE4', '#F8D9B0', '#E3E3E3']
  };


  schemeType: ScaleType = ScaleType.Linear

  commandesFournisseur: any = {}
  commandesClient: any = {}
  commandesGratuites: any = {}
  vente: any = {}
  clients: any = {}
  bestSellers: any = []

  constructor(private coreServices: CoreServiceService) {
    Object.assign(this, this.articles );
  }

  ngOnInit(): void {
    this.GetKpiCommande()
    this.GetBestSeller()
  }


  GetBestSeller() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };

    this.coreServices.GetBestSeller(data).then((response: any) => {
      this.articles = [];
      this.bestSellers = response.data.filter((item:any) => item.type == 'liquide');
      this.bestSellers.forEach((element:any) => {
        this.articles.push(
          {
            "name": element.libelle,
            "value":Number(element.totalVendu)
          });
      })
      const top10 = this.bestSellers.slice(0, 10);

      // Remplir articlesTop avec les données formatées
      this.articlesTop = top10.map((element: any) => ({
        name: element.libelle,
        value: Number(element.totalVendu)
      }));
      // this.getChartData()
      console.log(this.articles);
      console.log('bestSellers', this.bestSellers);
    })
  }

  GetKpiCommande() {
    this.coreServices.GetKpiCommande().then((response: any) => {
      this.commandesFournisseur = response.data.commandesFournisseur;
      this.commandesClient = response.data.commandesClient;
      this.commandesGratuites = response.data.commandesGratuites;
      this.vente = response.data.vente;
      this.clients = response.data.clients;
    })
  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
