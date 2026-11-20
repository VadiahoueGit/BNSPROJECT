import {Component,ElementRef,ViewChild,HostListener} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorageService} from '../core/local-storage.service';
import {storage_keys} from './shared-component/utils';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CoreServiceService} from "../core/core-service.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {hasPermission} from "../utils/utils";
import {CorsMonitorService} from "../core/cors-monitoring.service";
import {ParametreService} from "../core/parametre.service";
import {ConfigService} from "../core/config-service.service";

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})

export class FeaturesComponent {
  @ViewChild('popupNotif') popupNotif!: ElementRef;
  @ViewChild('bellIcon') bellIcon!: ElementRef;
  @HostListener('document:click', ['$event'])
  isModalOpen: boolean = false;
  currentUrl: string;
  submitError: Boolean = false;
  passwordForm: FormGroup
  hasNotif = false; // ou false selon s'il y a une notif
  showNotifications = false;
  activeTab: string = 'all';
  lastNotificationId:any = []
  notifications:any = [];

  items = [
    {label: 'Dashboard', icon: 'fas fa-chart-line', url: 'feature/dashboard',perm:'dashboard'},
    {label: 'Activités', icon: 'fas fa-truck-container', url: 'feature/activites',perm:'activite'},
    {label: 'Cartographie', icon: 'fas fa-map', url: '/feature/cartographie',perm:'carte'},
    {label: 'Rapports', icon: 'fas fa-file-chart-line', url: 'feature/rapport',perm:'rapport'},
    {label: 'Paramètres', icon: 'fas fa-cogs', url: 'feature/parametre',perm:'parametre'},
    {label: 'Achats', icon: 'fa-solid fa-cart-shopping', url: 'feature/achats',perm:'achat'},
    {label: 'Partenaires', icon: 'fas fa-handshake', url: '/feature/partenaire',perm:'partenaire'},
    {label: 'Finances', icon: 'fas fa-sack-dollar', url: 'feature/finances',perm:'finance'},
    {label: 'Stocks', icon: 'fas fa-warehouse-alt', url: 'feature/stocks',perm:'stock'},
    {label: 'Annonces', icon: 'fa-solid fa-bullhorn', url: 'feature/annonce',perm:'annonce'},
    { label: 'Administration', icon: 'fa-solid fa-sliders', url: 'feature/administration',perm:'admin' }
  ];
  UserInfo: any
  selectedItem: number | null = null;
  entrepriseConfig: any = null;
  depotHoteNom: string = '';

  constructor(
    private _auth: CoreServiceService,
    private router: Router,
    private coreServices: CoreServiceService,
    private localstorage: LocalStorageService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private corsMonitor: CorsMonitorService,
    private toastr: ToastrService,
    private parametreService: ParametreService,
    private configService: ConfigService,
  ) {
    this.currentUrl = this.router.url; // URL courante
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getLogoUrl(logoPath: string): string {
    if (!logoPath) return 'assets/image/armonyssansfond.png';
    if (logoPath.startsWith('http')) return logoPath;
    return (this.configService.docUrl || '').replace(/\/$/, '') + logoPath;
  }

  ngOnInit(): void {
    this.corsMonitor.startMonitoring();
    this.UserInfo = this.localstorage.getItem(storage_keys.STOREUser);

    this.parametreService.getEntrepriseConfig().then((cfg: any) => {
      this.entrepriseConfig = cfg;
    }).catch(() => {});

    this.coreServices.GetDepotList({ paginate: false, page: 1, limit: 100 }).then((res: any) => {
      const depots: any[] = res?.data || [];
      const hote = depots.find((d: any) => d.hote) || depots[0];
      if (hote) this.depotHoteNom = hote.nomDepot;
    }).catch(() => {});

    this.getNotifications(1);
    setInterval(() => {
      this.getNotifications(1);
    }, 120000);

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
    } else if (this.currentUrl.includes('/feature/administration')) {
      this.setActive(10)
    }

    if (this.UserInfo.isFirstLogin == true) {
      this.isModalOpen = true;
    }

    const storedNotif:any = this.localstorage.getItem(storage_keys.STORENotification);
    if (storedNotif) {
      this.lastNotificationId = storedNotif.id;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsidePopup = this.popupNotif?.nativeElement.contains(event.target);
    const clickedOnIcon = this.bellIcon?.nativeElement.contains(event.target);

    if (!clickedInsidePopup && !clickedOnIcon) {
      this.showNotifications = false;
    }
  }

  playSound() {
    const audio = new Audio();
    audio.src = 'assets/sound/notif.mp3';
    audio.load();
    audio.play();
  }
  getIconClass(type: string): string {
    switch (type) {
      case 'FINANCIERE': return 'fa-solid fa-money-check-dollar text-danger';
      case 'STOCK': return 'fa-solid fa-triangle-exclamation text-warning';
      case 'LOGISTIQUE': return 'fa-solid fa-truck text-primary';
      case 'COMMERCIALE': return 'fa-solid fa-user-slash text-success';
      case 'SYSTEME': return 'fa-solid fa-box-open text-success';
      default: return 'fa-solid fa-circle-info text-secondary';
    }
  }

  getColorClass(type: string): string {
    switch (type) {
      case 'FINANCIERE': return 'text-danger';    // rouge
      case 'LOGISTIQUE': return 'text-warning';     // orange
      case 'STOCK': return 'text-warning';     // orange
      case 'SYSTEME': return 'text-primary'; // bleu
      case 'COMMERCIALE': return 'text-success';// vert
      default: return 'text-secondary';        // gris
    }
  }
  setActive(index: number) {
    this.selectedItem = index;
  }

  getNotifications(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 10,
    };

    this.coreServices.GetNotifiaction(data).then(
      (response: any) => {
        if (response.statusCode === 200) {
          const newNotifications = response.data;

          if (newNotifications.length > 0) {
            const latestNotif = newNotifications[0]; // Supposé trié par date DESC
            // Récupère l'ancienne notif stockée localement
            const storedNotif:any = this.localstorage.getItem(storage_keys.STORENotification);
console.log(storedNotif);
            // Vérifie s'il y a une nouvelle notif (comparaison ID ou date)
            if (!storedNotif || storedNotif.id !== latestNotif.id) {
              this.hasNotif = true;
              this.playSound()
              // Sauvegarde la nouvelle notification dans le localStorage
              this.localstorage.setItem(storage_keys.STORENotification, latestNotif);
            }
          }

          this.notifications = newNotifications;
        } else {
          this.toastr.error(response.message);
        }
      },
      () => {
        this._spinner.hide();
        this.toastr.error('Erreur!', 'Erreur lors de la récupération.');
      }
    );


  }
  onSubmit() {
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
        this.toastr.error('Erreur!', 'Erreur lors de la récuperation.');
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
      finance: this.notifications.filter((n:any) => n.type === 'FINANCIERE').length,
      stock: this.notifications.filter((n:any) => n.type === 'STOCK').length,
      livraison: this.notifications.filter((n:any) => n.type === 'LOGISTIQUE').length,
      commercial: this.notifications.filter((n:any) => n.type === 'COMMERCIALE').length,
      system: this.notifications.filter((n:any) => n.type === 'SYSTEME').length
    };
  }

  get filteredNotifications() {
    return this.activeTab === 'all' ? this.notifications : this.notifications.filter((n:any) => n.type === this.activeTab);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      this.hasNotif = false;
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  protected readonly hasPermission = hasPermission;
}
