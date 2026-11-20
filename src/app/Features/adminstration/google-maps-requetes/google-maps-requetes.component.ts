import { Component, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ALERT_QUESTION } from '../../shared-component/utils';

// Panneau d'administration : envoie N requêtes à Google Maps (Geocoding, ou calcul d'itinéraire via la
// Routes API) et en affiche le bilan (statuts renvoyés, temps de réponse, derniers résultats).
// Chaque requête est facturée par Google. Le Navigation SDK, lui, n'existe que dans les apps mobiles
// natives et ne peut pas être appelé depuis le web : la Routes API est l'équivalent appelable ici.
@Component({
  selector: 'app-google-maps-requetes',
  templateUrl: './google-maps-requetes.component.html',
  styleUrls: ['./google-maps-requetes.component.scss'],
})
export class GoogleMapsRequetesComponent implements OnDestroy {
  // Clé utilisée par l'application (src/index.html, logistique.service.ts) ; modifiable pour tester une autre clé
  readonly CLE_PAR_DEFAUT = 'AIzaSyDJBENW4Gdx7U-cJr8XLHK3qHFd5jn8F_Q';
  readonly QUANTITE_MAX = 1000;
  readonly PARALLELE_MAX = 10;
  readonly SEUIL_CONFIRMATION = 50;

  typeRequete: 'inverse' | 'adresse' | 'itineraire' = 'inverse';
  cle = this.CLE_PAR_DEFAUT;
  latitude = 5.36;
  longitude = -4.0083;
  adresse = "Plateau, Abidjan, Côte d'Ivoire";
  // Itinéraire : départ = latitude/longitude ci-dessus, arrivée ci-dessous
  latitudeArrivee = 5.3167;
  longitudeArrivee = -4.0333;
  modeDeplacement: 'DRIVE' | 'TWO_WHEELER' | 'WALK' = 'DRIVE';
  readonly MODES = [
    { valeur: 'DRIVE', libelle: 'Voiture' },
    { valeur: 'TWO_WHEELER', libelle: 'Deux-roues' },
    { valeur: 'WALK', libelle: 'À pied' },
  ];
  quantite = 10;
  parallele = 1;
  delaiMs = 0;

  enCours = false;
  arretDemande = false;
  envoyees = 0;
  terminees = 0;
  statuts: { [statut: string]: number } = {};
  dureeTotaleMs = 0;
  dureeMinMs: number | null = null;
  dureeMaxMs: number | null = null;
  debut: number | null = null;
  fin: number | null = null;
  derniersResultats: { numero: number; statut: string; dureeMs: number; detail: string }[] = [];
  messageErreurGoogle = '';

  constructor(private toastr: ToastrService) {}

  ngOnDestroy() {
    this.arretDemande = true;
  }

  get pourcentage() {
    return this.quantiteLancee ? Math.round((this.terminees / this.quantiteLancee) * 100) : 0;
  }

  get dureeMoyenneMs() {
    return this.terminees ? Math.round(this.dureeTotaleMs / this.terminees) : 0;
  }

  get dureeEcouleeS() {
    if (!this.debut) return 0;
    return ((this.fin || Date.now()) - this.debut) / 1000;
  }

  get statutsListe() {
    return Object.keys(this.statuts)
      .map((statut) => ({ statut, nombre: this.statuts[statut] }))
      .sort((a, b) => b.nombre - a.nombre);
  }

  quantiteLancee = 0;

  classeStatut(statut: string) {
    if (statut === 'OK') return 'ok';
    if (statut === 'ZERO_RESULTS') return 'warn';
    return 'ko';
  }

  private valider(): string | null {
    const q = Number(this.quantite);
    if (!Number.isInteger(q) || q < 1 || q > this.QUANTITE_MAX) return `La quantité doit être un entier entre 1 et ${this.QUANTITE_MAX}.`;
    const p = Number(this.parallele);
    if (!Number.isInteger(p) || p < 1 || p > this.PARALLELE_MAX) return `Le nombre de requêtes simultanées doit être entre 1 et ${this.PARALLELE_MAX}.`;
    if (Number(this.delaiMs) < 0) return 'Le délai ne peut pas être négatif.';
    if (!this.cle?.trim()) return 'La clé API est obligatoire.';
    if (this.typeRequete === 'inverse' || this.typeRequete === 'itineraire') {
      if (this.latitude == null || this.latitude < -90 || this.latitude > 90) return 'Latitude invalide (entre -90 et 90).';
      if (this.longitude == null || this.longitude < -180 || this.longitude > 180) return 'Longitude invalide (entre -180 et 180).';
      if (this.typeRequete === 'itineraire') {
        if (this.latitudeArrivee == null || this.latitudeArrivee < -90 || this.latitudeArrivee > 90) return "Latitude d'arrivée invalide (entre -90 et 90).";
        if (this.longitudeArrivee == null || this.longitudeArrivee < -180 || this.longitudeArrivee > 180) return "Longitude d'arrivée invalide (entre -180 et 180).";
      }
    } else if (!this.adresse?.trim()) {
      return "L'adresse est obligatoire.";
    }
    return null;
  }

  async OnLancer() {
    const erreur = this.valider();
    if (erreur) {
      this.toastr.warning(erreur);
      return;
    }
    if (this.quantite >= this.SEUIL_CONFIRMATION) {
      const res = await ALERT_QUESTION(
        'warning',
        'Confirmer',
        `Envoyer ${this.quantite} requêtes à Google Maps ? Chaque requête est décomptée et facturée sur le compte Google de la clé.`
      );
      if (res.isConfirmed != true) return;
    }
    this.lancer();
  }

  OnArreter() {
    this.arretDemande = true;
  }

  OnReinitialiser() {
    if (this.enCours) return;
    this.reinitialiserBilan();
    this.quantiteLancee = 0;
  }

  private reinitialiserBilan() {
    this.envoyees = 0;
    this.terminees = 0;
    this.statuts = {};
    this.dureeTotaleMs = 0;
    this.dureeMinMs = null;
    this.dureeMaxMs = null;
    this.debut = null;
    this.fin = null;
    this.derniersResultats = [];
    this.messageErreurGoogle = '';
  }

  // URL et options fetch de la requête à répéter
  private construireRequete(): { url: string; init?: RequestInit } {
    if (this.typeRequete === 'itineraire') {
      // Routes API (computeRoutes). Le masque de champs limite la réponse à la distance et à la durée.
      const point = (lat: number, lng: number) => ({ location: { latLng: { latitude: Number(lat), longitude: Number(lng) } } });
      return {
        url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.cle.trim(),
            'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
          },
          body: JSON.stringify({
            origin: point(this.latitude, this.longitude),
            destination: point(this.latitudeArrivee, this.longitudeArrivee),
            travelMode: this.modeDeplacement,
          }),
        },
      };
    }
    const base = 'https://maps.googleapis.com/maps/api/geocode/json';
    const cle = encodeURIComponent(this.cle.trim());
    if (this.typeRequete === 'inverse') {
      return { url: `${base}?latlng=${this.latitude},${this.longitude}&key=${cle}` };
    }
    return { url: `${base}?address=${encodeURIComponent(this.adresse.trim())}&key=${cle}` };
  }

  // Réponse de la Routes API → statut au format Geocoding (OK, ZERO_RESULTS, ou statut d'erreur Google)
  private lireReponseRoutes(res: any): { statut: string; detail: string } {
    if (res?.error) return { statut: res.error.status || `HTTP_${res.error.code}`, detail: res.error.message || '' };
    const route = res?.routes?.[0];
    if (!route) return { statut: 'ZERO_RESULTS', detail: 'Aucun itinéraire trouvé' };
    const km = (Number(route.distanceMeters || 0) / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    const minutes = Math.round(parseInt(route.duration || '0', 10) / 60);
    return { statut: 'OK', detail: `${km} km · ${minutes} min` };
  }

  private async lancer() {
    this.reinitialiserBilan();
    this.enCours = true;
    this.arretDemande = false;
    this.quantiteLancee = Number(this.quantite);
    this.debut = Date.now();
    const requete = this.construireRequete();
    const delai = Number(this.delaiMs) || 0;

    // N « travailleurs » se partagent les requêtes : au plus `parallele` requêtes en vol à la fois
    const travailleur = async () => {
      while (!this.arretDemande && this.envoyees < this.quantiteLancee) {
        const numero = ++this.envoyees;
        await this.envoyer(requete, numero);
        if (delai > 0 && !this.arretDemande) await new Promise((r) => setTimeout(r, delai));
      }
    };
    await Promise.all(Array.from({ length: Math.min(this.parallele, this.quantiteLancee) }, () => travailleur()));

    this.fin = Date.now();
    this.enCours = false;
    const ok = this.statuts['OK'] || 0;
    if (this.arretDemande) {
      this.toastr.info(`Arrêté : ${this.terminees} requête(s) envoyée(s), ${ok} OK.`);
    } else if (ok === this.terminees) {
      this.toastr.success(`${this.terminees} requête(s) envoyée(s), toutes OK.`);
    } else {
      this.toastr.warning(`${this.terminees} requête(s) envoyée(s), ${ok} OK, ${this.terminees - ok} en échec.`);
    }
  }

  private async envoyer(requete: { url: string; init?: RequestInit }, numero: number) {
    const t0 = performance.now();
    let statut: string;
    let detail = '';
    try {
      // fetch et non HttpClient : l'intercepteur d'authentification ajouterait le jeton de
      // l'utilisateur (Authorization) aux requêtes envoyées à Google.
      const reponse = await fetch(requete.url, requete.init);
      const res: any = await reponse.json().catch(() => null);
      if (this.typeRequete === 'itineraire' && res) {
        ({ statut, detail } = this.lireReponseRoutes(res));
        if (statut !== 'OK' && res.error?.message) this.messageErreurGoogle = res.error.message;
      } else if (!reponse.ok && !res?.status) {
        throw { status: reponse.status, error: res };
      } else if ((statut = res?.status || 'INCONNU') === 'OK') {
        detail = res.results?.[0]?.formatted_address || '';
      } else {
        detail = res?.error_message || '';
        if (res?.error_message) this.messageErreurGoogle = res.error_message;
      }
    } catch (err: any) {
      statut = err?.status ? `HTTP_${err.status}` : 'ERREUR_RESEAU';
      detail = err?.error?.error_message || err?.message || '';
      if (err?.error?.error_message) this.messageErreurGoogle = err.error.error_message;
    }
    const duree = Math.round(performance.now() - t0);
    this.terminees++;
    this.statuts[statut] = (this.statuts[statut] || 0) + 1;
    this.dureeTotaleMs += duree;
    this.dureeMinMs = this.dureeMinMs == null ? duree : Math.min(this.dureeMinMs, duree);
    this.dureeMaxMs = this.dureeMaxMs == null ? duree : Math.max(this.dureeMaxMs, duree);
    this.derniersResultats.unshift({ numero, statut, dureeMs: duree, detail });
    if (this.derniersResultats.length > 20) this.derniersResultats.pop();
  }
}
