import {ChangeDetectorRef, Component,AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import {data} from 'jquery';
import {NgxSpinnerService} from 'ngx-spinner';
import {Subscription} from 'rxjs';
import {CoreServiceService} from 'src/app/core/core-service.service';
import {LogistiqueService} from 'src/app/core/logistique.service';
import {UtilisateurResolveService} from 'src/app/core/utilisateur-resolve.service';
import {WebsocketService} from 'src/app/core/webSocket.service';
import {ArticleServiceService} from "../../core/article-service.service";
declare var google: any;
@Component({
  selector: 'app-cartographie',
  templateUrl: './cartographie.component.html',
  styleUrls: ['./cartographie.component.scss']
})
export class CartographieComponent implements AfterViewInit{
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;
  panelOpenOsr: boolean = false;
  panelOpenDepot: boolean = false;
  panelOpenRevendeur: boolean = false;
  depotList!: []
  private messageSubscription: Subscription;
  messages: string[] = [];
  clientList!: []
  vehiculeList!: []
  revendeurList!: []
  tokenGoogle: string
  markersClient: any[] = [];
  markersRevendeur: any[] = [];
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
        stylers: [{visibility: 'off'}],
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

  constructor(private _articleService:ArticleServiceService,private websocketService: WebsocketService, private cdr: ChangeDetectorRef, private _coreService: CoreServiceService, private logisiticService: LogistiqueService, private utilisateurService: UtilisateurResolveService, private _spinner: NgxSpinnerService,) {
  }

  ngOnInit() {
//     this.websocketService.connect('ws://wsbnsapi.localdev.business/');
// // Abonnez-vous pour recevoir les messages
//     this.messageSubscription = this.websocketService.getMessages().subscribe(
//       (message) => {
//         this.messages.push(message);
//         console.log(this.messages);
//       },
//       (error) => {
//         console.error('Error receiving message:', error);
//       }
//     );

//     this.GetClientOSRList();
    this.getPosition();
    // this.GetDepotList();
    this.GetGoogleJWT();
  }

  ngAfterViewInit(): void {

    setTimeout(() => {
      if (this.mapElement) {
        this.loadGoogleMapsScript().then(() => {
          this.initMap();
          this.GetRevendeurList(1)
        }).catch((error) => {
          console.error("Erreur de chargement de Google Maps :", error);
        });
      } else {
        console.error("L'élément #mapContainer n'a pas été trouvé !");
      }
    }, 1000);


  }

  // Charger le script de l'API Google Maps
  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDV1ke-HxBDmSPpqyfivksnjzeD29AC18k';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }
  initMap() {
    if (!this.mapElement) {
      console.error("L'élément #mapContainer n'a pas été trouvé !");
      return;
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: this.currentPosition.lat, lng: this.currentPosition.lng }, // Paris
      zoom: 12
    });
  }

  // ngOnDestroy(): void {
  //   // Se désabonner lorsque le composant est détruit
  //   if (this.messageSubscription) {
  //     this.messageSubscription.unsubscribe();
  //   }
  //
  //   // Fermer la connexion WebSocket
  //   this.gpsWebSocketService.closeConnection();
  // }

  sendMessage(): void {
    const message = 'Hello WebSocket!';
    if (message.trim()) {
      this.websocketService.sendMessage({message: message});
      console.log('Message envoyé:', message);
    }

  }

  // Méthode pour envoyer des données GPS
  sendGpsData(): void {
    const data = {latitude: 48.8566, longitude: 2.3522}; // Exemple de données GPS
    this.sendMessage();
  }

  async addMarker(data: any, type: string) {
    // Import libraries dynamically
    const {Map, InfoWindow} = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
    const {
      AdvancedMarkerElement,
      PinElement
    } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

    // console.log('data', data)
    if (type == 'osr') {
      console.log(this.createCustomPinContent(type))
      this.markersClient = data.map((position: any, i: number) => {
        // console.log('position', position);
        const positions = {
          lat: parseFloat(position.latitude),
          lng: parseFloat(position.longitude),
        };
        const marker = new AdvancedMarkerElement({
          position: positions, // Correction ici (le champ est "position", pas "positions")
          content: this.createCustomPinContent(type), // Élément DOM du marqueur
          title: (position.id).toString(),
        });
        // console.log('container', marker)
        return marker;
      });

    } else if (type == 'revendeur') {
      console.log(data)

      data.forEach((location: any) => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: new google.maps.LatLng(Number(location.latitude), Number(location.longitude)),
          title: location.title
        });

        // Attacher chaque marqueur à la carte
        marker.map = this.map;
      });

      // this.markersRevendeur = data.map((position: any, i: number) => {
      //   console.log(position);
      //   const positions = {
      //     lat: parseFloat(position.latitude),
      //     lng: parseFloat(position.longitude),
      //   };
      //   const marker = new AdvancedMarkerElement({
      //     position: positions, // Correction ici (le champ est "position", pas "positions")
      //     content: this.createCustomPinContent(type), // Élément DOM du marqueur
      //     title: (position.id).toString()
      //   });
      //   // console.log('container', marker)
      //   return marker;
      // });
    }else if (type == 'vehicule') {
      this.markersVehicule = data.map((position: any, i: number) => {
        // console.log(position);
        const positions = {
          lat: parseFloat(position.latitude),
          lng: parseFloat(position.longitude),
        };
        const marker = new AdvancedMarkerElement({
          position: positions, // Correction ici (le champ est "position", pas "positions")
          content: this.createCustomPinContent(type), // Élément DOM du marqueur
          title: (position.id).toString()
        });
        // console.log('container', marker)
        return marker;
      });
    } else if (type == 'depot') {
      this.markersDepot = data.map((position: any, i: number) => {
        // console.log('positionDepot', position);
        const positions = {
          lat: parseFloat(position.latitude),
          lng: parseFloat(position.longitude),
        };
        const marker = new AdvancedMarkerElement({
          position: positions, // Correction ici (le champ est "position", pas "positions")
          content: this.createCustomPinContent(type), // Élément DOM du marqueur
          title: (position.id).toString()
        });
        // console.log('container', marker)
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
    } else if (iconType == 'revendeur') {
      icon.src = 'assets/icon/store.png';
    }

    icon.style.width = '25px';
    icon.style.height = '25px';
    container.appendChild(icon);
    // console.log('container', container)
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

  togglePanelRevendeur(data: any) {
    this.panelOpenRevendeur = !this.panelOpenRevendeur;
    if (data != null) {

      this.slideDetails = this.revendeurList.find((client: any) => client.id === parseInt(data.title))
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

  openInfoWindowRevendeur(marker: any) {
    this.togglePanelRevendeur(marker)
  }

  closeInfoWindowRevendeur() {
    this.togglePanelRevendeur(null)
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

  GetRevendeurList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._articleService.GetListRevendeur(data).then((res: any) => {
      console.log('GetListRevendeur:::>', res);
      this.revendeurList = res.data;
      this.addMarker(res.data, 'revendeur')
      this._spinner.hide();
    });
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
