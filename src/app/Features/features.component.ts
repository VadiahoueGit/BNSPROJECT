import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorageService} from '../core/local-storage.service';
import {storage_keys} from './shared-component/utils';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CoreServiceService} from "../core/core-service.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  isModalOpen: boolean = false;
  currentUrl: string;
  submitError: Boolean = false;
  passwordForm: FormGroup
  hasNotif = true; // ou false selon s'il y a une notif
  showNotifications = false;
  activeTab: string = 'all';

  notifications = [
    {
      id: 2,
      type: "FINANCIERE",
      categorie: "Dépassement d’encours client",
      titre: "Client REVDG3H03JT a dépassé son encours !",
      message: "Votre encours est négatif  : 1459000).",
      metadata: {
        Encours: 1459000,
        clientId: 6,
        clientType: "revendeur"
      },
      estTraitee: false,
      dateTraitement: null,
      commentaireTraitement: null,
      actionRecommandee: "Bloquer la commande ou prévenir le commercial.",
      notifiee: false,
      dateNotification: null,
      estArchivee: false,
      createdAt: "2025-07-03T07:45:57.690Z",
      updatedAt: "2025-07-03T07:45:57.690Z"
    }
  ];

  items = [
    {label: 'Dashboard', icon: 'fas fa-chart-line', url: 'feature/dashboard'},
    {label: 'Activités', icon: 'fas fa-truck-container', url: 'feature/activites'},
    {label: 'Cartographie', icon: 'fas fa-map', url: '/feature/cartographie'},
    {label: 'Rapports', icon: 'fas fa-file-chart-line', url: 'feature/rapport'},
    {label: 'Paramètres', icon: 'fas fa-cogs', url: 'feature/parametre'},
    {label: 'Achats', icon: 'fa-solid fa-cart-shopping', url: 'feature/achats'},
    {label: 'Partenaires', icon: 'fas fa-handshake', url: '/feature/partenaire'},
    {label: 'Finances', icon: 'fas fa-sack-dollar', url: 'feature/finances'},
    {label: 'Stocks', icon: 'fas fa-warehouse-alt', url: 'feature/stocks'},
    {label: 'Annonces', icon: 'fa-solid fa-bullhorn', url: 'feature/annonce'},
    // { label: 'Données de références', icon: 'fas fa-warehouse-alt', url: 'feature/datareference' }
  ];
  UserInfo: any
  selectedItem: number | null = null;

  constructor(private _auth: CoreServiceService, private router: Router, private coreServices: CoreServiceService, private localstorage: LocalStorageService, private _spinner: NgxSpinnerService,
              private fb: FormBuilder,
              private toastr: ToastrService,) {
    this.currentUrl = this.router.url; // URL courante
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.UserInfo = this.localstorage.getItem(storage_keys.STOREUser);
    console.log(this.UserInfo)
    // if (this.currentUrl.includes('parametre')) {
    if (this.currentUrl.includes('/feature/dashboard')) {
      this.setActive(0)
    } else if (this.currentUrl.includes('/feature/activite')) {
      this.setActive(1)
    } else if (this.currentUrl.includes('/feature/cartographie')) {
      this.setActive(2)
    } else if (this.currentUrl.includes('/feature/rapport')) {
      this.setActive(3)
    } else if (this.currentUrl.includes('/feature/parametre')) {
      this.setActive(4)
    } else if (this.currentUrl.includes('/feature/achat')) {
      this.setActive(5)
    } else if (this.currentUrl.includes('/feature/partenaire')) {
      this.setActive(6)
    } else if (this.currentUrl.includes('/feature/finance')) {
      this.setActive(7)
    } else if (this.currentUrl.includes('/feature/stocks')) {
      this.setActive(8)
    } else if (this.currentUrl.includes('/feature/annonce')) {
      this.setActive(9)
    }

    if (this.UserInfo.isFirstLogin == true) {
      this.isModalOpen = true;
    }
  }
  getIconClass(type: string): string {
    switch (type) {
      case 'FINANCIERE': return 'fa-solid fa-arrow-down text-danger';
      case 'stock': return 'fa-solid fa-triangle-exclamation text-warning';
      case 'livraison': return 'fa-solid fa-truck text-primary';
      case 'commercial': return 'fa-solid fa-user-slash text-success';
      default: return 'fa-solid fa-circle-info text-secondary';
    }
  }

  getColorClass(type: string): string {
    switch (type) {
      case 'FINANCIERE': return 'text-danger';    // rouge
      case 'stock': return 'text-warning';     // orange
      case 'livraison': return 'text-primary'; // bleu
      case 'commercial': return 'text-success';// vert
      default: return 'text-secondary';        // gris
    }
  }
  setActive(index: number) {
    this.selectedItem = index;
  }

  onSubmit() {
    this._spinner.show()
    let data = {
      "email": this.UserInfo.email,
      "oldPassword": this.passwordForm.controls['password'].value,
      "newPassword": this.passwordForm.controls['newPassword'].value,
      "userType": "user"
    }
    this.coreServices.UpdatePasswordFirstConnexion(data).then((response: any) => {
        if (response.statusCode == 200) {
          console.log('mot de passe mis à jour avec succès', response);


          let loginData = {
            "login": this.UserInfo.email,
            "password": this.passwordForm.controls['newPassword'].value,
            "appType": "BO"
          }
          this._auth.ToConnect(loginData).then((res: any) => {
            console.log(res);
            if (res.access_token) {
              this.localstorage.setItem(storage_keys.STOREToken, res.access_token)
              this.localstorage.setItem(storage_keys.STOREUser, res.user)
              this._spinner.hide();
              this.toastr.success(response.message);
              this.isModalOpen = false;
            }
          });

        } else {
          this._spinner.hide();
          this.toastr.error(response.message);
        }

      },
      (error: any) => {
        this._spinner.hide()
        this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
        console.error('Erreur lors de la mise à jour', error);
      }
    );

  }

  navigate(url: string, index: number) {
    console.log(url)
    this.setActive(index)
    this.router.navigate([url]);
  }

  updateProfile() {
  }

  logout() {
    this.localstorage.clear()
    this.router.navigate(['/login'])
  }




  get totalNotifications() {
    return this.notifications.length;
  }

  get countByType() {
    return {
      finance: this.notifications.filter(n => n.type === 'FINANCIERE').length,
      stock: this.notifications.filter(n => n.type === 'stock').length,
      livraison: this.notifications.filter(n => n.type === 'livraison').length,
      commercial: this.notifications.filter(n => n.type === 'commercial').length
    };
  }

  get filteredNotifications() {
    return this.activeTab === 'all' ? this.notifications : this.notifications.filter(n => n.type === this.activeTab);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
