import {ChangeDetectorRef, Component,AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import {data} from 'jquery';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, Subscription} from 'rxjs';
import {CoreServiceService} from 'src/app/core/core-service.service';
import {LogistiqueService} from 'src/app/core/logistique.service';
import {UtilisateurResolveService} from 'src/app/core/utilisateur-resolve.service';
import {WebsocketService} from 'src/app/core/webSocket.service';
import {ArticleServiceService} from "../../core/article-service.service";
declare var google: any;
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { io, Socket } from 'socket.io-client';
@Component({
  selector: 'app-cartographie',
  templateUrl: './cartographie.component.html',
  styleUrls: ['./cartographie.component.scss']
})
export class CartographieComponent implements AfterViewInit{
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;
  panelOpenOsr: boolean = false;
  panelOpenDepot: boolean = false;
  panelOpenRevendeur: boolean = false;
  depotList!: []
  private messageSubscription: Subscription;
  messages: string[] = [];
  clientList!: []
  vehiculeList:any[] = [];
  vehiculeOnDrive :any[] = [];
  revendeurList!: []
  tokenGoogle: string
  markersClient: any[] = [];
  markersRevendeur: any[] = [];
  address: string
  slideDetails: any = null
  markersDepot: any[] = [];
  markersVehicule: any[] = [];
  data  = {
    driver:{
      "id": 18,
      "code": "TRANS6MK64",
      "nom": "TIMITE",
      "prenoms": "BORDJOBA",
      "nomDepot": "BNS ABENGOUROU",
      "telephone": "0789718242",
      "email": "bordjobatimite@bestnegoce.com",
      "login": "TRANS6MK64",
      "role": "transporteur",
    },
    vehicle:{
      "id": 13,
      "marque": "ISUZU",
      "energie": "GASOIL",
      "immatriculation": "736LJ01",
      "capacite": 450,
      "dateDeVisite": "2026-05-22T02:00:00.000Z",
      "dateAcqui": "2025-03-20T01:00:00.000Z",
    },
    position:{
      latitude:'',
      longitude:''
    }

  }
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
  message = 'Mercon';

  coordinates: any[] = [];
  private gpsSubscription: Subscription;
  private socket: Socket;
  constructor(private _articleService:ArticleServiceService,private websocketService: WebsocketService, private cdr: ChangeDetectorRef, private _coreService: CoreServiceService, private logisiticService: LogistiqueService, private utilisateurService: UtilisateurResolveService, private _spinner: NgxSpinnerService,) {


  }

  ngOnInit() {

    this.GetClientOSRList();
    this.getPosition();
    this.GetDepotList();
    this.GetGoogleJWT();
  }

  send(): void {
    // if (this.message.trim() !== '') {
      this.websocketService.sendMessage(this.message);
      // this.message = '';
    // }
  }
  ngAfterViewInit(): void {
    this.GetRevendeurList(1)
    this.GetVehiculeList(1)

  }
  GetVehiculeList(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.logisiticService.GetVehiculeList(data).then((res: any) => {
      this.vehiculeList = res.data

      this.messageSubscription = this.websocketService.ecouterNouveauMessage()
        .subscribe((data: any) => {
          const vehicule = typeof data === 'string' ? JSON.parse(data) : data;

          // Identifiant unique : id ou immatriculation
          const incomingId = vehicule?.vehicle?.id;

          if (!incomingId) return; // sécuriser si véhicule mal formé

          // Chercher un véhicule déjà présent dans vehiculeOnDrive
          const index = this.vehiculeList.findIndex(v => v.id === incomingId);

          if (index !== -1) {
            // Si le véhicule est déjà en circulation, on le remplace
            this.vehiculeOnDrive[index] = vehicule;
          } else {
            // On vérifie qu’il existe dans la liste officielle
            const existeDansVehiculeList = this.vehiculeList.some(v => v.id === incomingId);

            if (existeDansVehiculeList) {
              this.vehiculeOnDrive.push(vehicule);
            } else {
              console.warn('Véhicule reçu non reconnu :', vehicule);
            }
          }

          console.log('Véhicules en circulation :', this.vehiculeOnDrive);
        });
    })
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
      this.markersClient = data.map((pdv:any) => ({
        position: {
          lat: parseFloat(pdv.latitude),
          lng: parseFloat(pdv.longitude),
        },
        label: pdv.nomEtablissement,
        icon: {
          url: 'assets/icon/prospect.png', // chemin vers ton image
          scaledSize: { width: 25, height: 25} // optionnel : ajuste la taille
        }
      }));
    } else if (type == 'revendeur') {
      this.markersRevendeur = data.map((pdv:any) => ({
        position: {
          lat: parseFloat(pdv.latitude),
          lng: parseFloat(pdv.longitude),
        },
        label: pdv.raisonSocial,
        icon: {
          url: 'assets/icon/store.png', // chemin vers ton image
          scaledSize: { width: 25, height: 25} // optionnel : ajuste la taille
        }
      }));

    }else if (type == 'depot') {
      this.markersDepot = data.map((pdv:any) => ({
        position: {
          lat: parseFloat(pdv.latitude),
          lng: parseFloat(pdv.longitude),
        },
        label: pdv.nomDepot,
        icon: {
          url: 'assets/icon/depot.png', // chemin vers ton image
          scaledSize: { width: 25, height: 25} // optionnel : ajuste la taille
        }
      }));
    }
    else if (type == 'vehicule') {
      this.markersVehicule = data.map((pdv:any) => ({
        position: {
          lat: parseFloat(pdv.latitude),
          lng: parseFloat(pdv.longitude),
        },
        // label: pdv.nomEtablissement,
        icon: {
          url: 'assets/icon/delivery.png', // chemin vers ton image
          scaledSize: { width: 25, height: 25} // optionnel : ajuste la taille
        }
      }));

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
    if (data !== null) {
      this.togglePanelRevendeur(null);
      this.togglePanelDepot(null);
      this.panelOpenOsr = !this.panelOpenOsr;
      this.slideDetails = this.clientList.find((client: any) => client.nomEtablissement === data.label);
    } else {
      this.panelOpenOsr = false;
    }
  }

  togglePanelDepot(data: any) {
    if (data !== null) {
      this.togglePanelOsr(null);
      this.togglePanelRevendeur(null);
      this.panelOpenDepot = !this.panelOpenDepot;
      this.slideDetails = this.depotList.find((client: any) => client.nomDepot === data.label);
    } else {
      this.panelOpenDepot = false;
    }
  }

  togglePanelRevendeur(data: any) {
    if (data !== null) {
      this.togglePanelOsr(null);
      this.togglePanelDepot(null);
      this.panelOpenRevendeur = !this.panelOpenRevendeur;
      this.slideDetails = this.revendeurList.find((client: any) => client.raisonSocial === data.label);
    } else {
      this.panelOpenRevendeur = false;
    }
  }

  openInfoWindowOsr(marker: any) {
    console.log(marker);
    this.togglePanelOsr(marker)
  }

  closeInfoWindowOsr() {
    this.togglePanelOsr(null)
    this.togglePanelRevendeur(null)
    this.togglePanelDepot(null)
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
      page: 1,
      limit: 8,
      proprietaire: '',
      groupeClient:'',
      raisonSociale: '',
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
      depot: '',
      etablissement: '',
      statut: '',
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
