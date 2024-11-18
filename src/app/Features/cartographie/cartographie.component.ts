import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LogistiqueService } from 'src/app/core/logistique.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';

@Component({
  selector: 'app-cartographie',
  templateUrl: './cartographie.component.html',
  styleUrls: ['./cartographie.component.scss']
})
export class CartographieComponent {
  dataList!: []
  markers: any[] = [];
  latitude: number | undefined;
  longitude: number | undefined;
  currentPosition: any
  mapOptions: google.maps.MapOptions = {
    styles: [
      {
        featureType: 'poi', // Points of interest
        stylers: [{ visibility: 'off' }],
      },
    ],
  };
  constructor(private logisiticService: LogistiqueService, private utilisateurService: UtilisateurResolveService, private _spinner: NgxSpinnerService,) {
  }
  ngOnInit() {
    this.GetClientOSRList()
    this.getPosition()
    // this.logisiticService.getAccessToken().then(res=>{console.log('kk')})
  }

  GetClientOSRList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.utilisateurService.GetPointDeVenteList(data).then((res: any) => {
      console.log('GetClientOSRList:::>', res);
      this.dataList = res.data;
      this.addMarker(res.data)
      this._spinner.hide();
    });
  }

  addMarker(data:any) {
     // Transformation des données en marqueurs
     this.markers = data.map((point:any) => ({
      position: {
        lat: parseFloat(point.latitude),
        lng: parseFloat(point.longitude),
      },
      title: point.nom,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new google.maps.Size(32, 32)
      }
    }));
    console.log('marker',this.markers)
  }
  getPosition(): void {
    this._spinner.show();
    this.logisiticService.getCurrentPosition().then(
      (position) => {
        this._spinner.hide();
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('currentPosition', this.currentPosition);

      },
      (error) => {
        console.error('Error getting location', error);
      }
    );
  }
}
