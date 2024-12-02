import { ChangeDetectorRef, Component } from '@angular/core';
import { data } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { LogistiqueService } from 'src/app/core/logistique.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { GpsWebSocketService } from 'src/app/core/webSocket.service';

@Component({
  selector: 'app-cartographie',
  templateUrl: './cartographie.component.html',
  styleUrls: ['./cartographie.component.scss']
})
export class CartographieComponent {
  panelOpenOsr: boolean = false;
  panelOpenDepot: boolean = false;
  depotList!: []

  clientList!: []
  vehiculeList!: []
  tokenGoogle: string
  markersClient: any[] = [];
  address: string
  slideDetails: any = null
  markersDepot: any[] = [];
  markersVehicule: any[] = [];
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
  infoWindow = {
    visible: false,
    position: null,
    content: '',
    top: '0px', // Ajoutez la propriété top
    left: '0px' // Ajoutez la propriété left
  };
  coordinates: any[] = [];
  private gpsSubscription: Subscription;
  constructor(private gpsWebSocketService: GpsWebSocketService, private cdr: ChangeDetectorRef, private _coreService: CoreServiceService, private logisiticService: LogistiqueService, private utilisateurService: UtilisateurResolveService, private _spinner: NgxSpinnerService,) {
  }
  ngOnInit() {
    setInterval(() => {
      console.log(this.gpsWebSocketService.isConnected())
      
    },1000)
    if (this.gpsWebSocketService.isConnected()) {
      console.log('WebSocket est connecté');
    } else {
      console.warn('WebSocket n’est pas connecté, tentative de reconnexion...');
      this.reconnect();
    }

    // Active l'abonnement aux messages
    this.gpsSubscription = this.gpsWebSocketService.getCoordinates().subscribe({
      next: (data) => {
        console.log('Message reçu via WebSocket :', data);
        if (data.latitude && data.longitude) {
          this.coordinates.push(data);
          // Par exemple, ajouter un marqueur sur la carte
          this.addMarker([data], 'vehicule');
        } else {
          console.warn('Message non conforme reçu :', data);
        }
      },
      error: (err) => console.error('Erreur WebSocket :', err),
    });
  
    // Tester l'envoi d'un message
    this.sendGpsData();
  
    this.GetClientOSRList();
    this.getPosition();
    this.GetDepotList();
    this.GetGoogleJWT();
  }
  

  // Méthode pour envoyer des données GPS
  sendGpsData(): void {
    const data = { latitude: 48.8566, longitude: 2.3522 }; // Exemple de données GPS
    this.gpsWebSocketService.sendMessage(data);
  }

  // Méthode pour tenter la reconnexion
  reconnect(): void {
    // this.gpsWebSocketService.reconnect();
  }
  
  async addMarker(data: any, type: string) {
    // Import libraries dynamically
    const { Map, InfoWindow } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
    const { AdvancedMarkerElement, PinElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

    console.log('data', data)
    if (type == 'osr') {
      this.markersClient = data.map((position: any, i: number) => {
        console.log('position',position);
        const positions = {
          lat: parseFloat(position.latitude),
          lng: parseFloat(position.longitude),
        };
        const marker = new AdvancedMarkerElement({
          position: positions, // Correction ici (le champ est "position", pas "positions")
          content: this.createCustomPinContent(type), // Élément DOM du marqueur
          title: (position.id).toString()
        });
        console.log('container', marker)
        return marker;
      });

    } else if (type == 'vehicule') {
      this.markersVehicule = data.map((position: any, i: number) => {
        console.log(position);
        const positions = {
          lat: parseFloat(position.latitude),
          lng: parseFloat(position.longitude),
        };
        const marker = new AdvancedMarkerElement({
          position: positions, // Correction ici (le champ est "position", pas "positions")
          content: this.createCustomPinContent(type), // Élément DOM du marqueur
          title: (position.id).toString()
        });
        console.log('container', marker)
        return marker;
      });
    } else if (type == 'depot') {
      this.markersDepot = data.map((position: any, i: number) => {
        console.log(position);
        const positions = {
          lat: parseFloat(position.latitude),
          lng: parseFloat(position.longitude),
        };
        const marker = new AdvancedMarkerElement({
          position: positions, // Correction ici (le champ est "position", pas "positions")
          content: this.createCustomPinContent(type), // Élément DOM du marqueur
          title: (position.id).toString()
        });
        console.log('container', marker)
        return marker;
      });
    }

  }

  createCustomPinContent(iconType: string): HTMLElement {
    const container = document.createElement('div');
    container.style.position = 'relative';

    // Ajout de l'icône
    const icon = document.createElement('img');
    if (iconType == 'osr') {
      icon.src = 'assets/icon/prospect.png';
    } else if (iconType == 'vehicule') {
      icon.src = 'assets/icon/delivery.png';
    } else if (iconType == 'depot') {
      icon.src = 'assets/icon/depot.png';
    }

    icon.style.width = '25px';
    icon.style.height = '25px';
    container.appendChild(icon);
    console.log('container', container)
    return container;
  }

  togglePanelOsr(data: any) {
    this.panelOpenOsr = !this.panelOpenOsr;
    if (data != null) {

      this.slideDetails = this.clientList.find((client: any) => client.id === parseInt(data.title))
      this.getAdress(this.slideDetails.latitude, this.slideDetails.longitude)
    }

  }

  togglePanelDepot(data: any) {
    this.panelOpenDepot = !this.panelOpenDepot;
    if (data != null) {

      this.slideDetails = this.depotList.find((client: any) => client.id === parseInt(data.title))
      this.getAdress(this.slideDetails.latitude, this.slideDetails.longitude)
    }

  }

  openInfoWindowOsr(marker: any) {
    this.togglePanelOsr(marker)
  }

  closeInfoWindowOsr() {
    this.togglePanelOsr(null)
  }

  openInfoWindowDepot(marker: any) {
    this.togglePanelDepot(marker)
  }

  closeInfoWindowDepot() {
    this.togglePanelDepot(null)
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


  GetClientOSRList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.utilisateurService.GetPointDeVenteList(data).then((res: any) => {
      console.log('GetClientOSRList:::>', res);
      this.clientList = res.data;
      this.addMarker(res.data, 'osr')
      this._spinner.hide();
    });
  }

  GetDepotList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetDepotList(data).then((res: any) => {
      console.log('DEPOT:::>', res);
      this.depotList = res.data;
      this.addMarker(res.data, 'depot')
      this._spinner.hide();
    });
  }

  GetGoogleJWT() {
    this._spinner.show();
    this._coreService.GetGoogleJWT().then((res: any) => {
      console.log('GetGoogleJWT:::>', res);
      this.tokenGoogle = res.token;
      this._spinner.hide();
    });
  }

  ngOnDestroy(): void {
    if (this.gpsSubscription) {
      this.gpsSubscription.unsubscribe();
    }
    this.gpsWebSocketService.closeConnection();
  }

  getAdress(lat: any, lng: any) {
    // this.logisiticService.getAddress(lat, lng).subscribe((response: any) => {
    //   console.log(response)
    //   if (response.results && response.results.length > 0) {
    //     this.address = response.results[0].formatted_address;  // Adresse formatée
    //   } else {
    //     this.address = 'Adresse non trouvée';
    //   }
    // });
  }
}
