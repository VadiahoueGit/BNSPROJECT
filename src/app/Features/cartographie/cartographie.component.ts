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
  dataList!:[]
  latitude: number | undefined;
  longitude: number | undefined;
  currentPosition:any
  mapOptions: google.maps.MapOptions = {
    styles: [
      {
        featureType: 'poi', // Points of interest
        stylers: [{ visibility: 'off' }],
      },
    ],
  };
  constructor(private logisiticService:LogistiqueService,private utilisateurService: UtilisateurResolveService,private _spinner: NgxSpinnerService,) {
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
      this._spinner.hide();
    });
  }


  getPosition(): void {
    this._spinner.show();
    this.logisiticService.getCurrentPosition().then(
      (position) => {
        this._spinner.hide();
        console.log(position);
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      },
      (error) => {
        console.error('Error getting location', error);
      }
    );
  }
}
