import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: any;
  private configLoaded = false;
  constructor(private http: HttpClient) {}
  async loadConfig(): Promise<void> {
    if (this.configLoaded) return;

    // 🔍 Détection automatique de l’environnement
    const hostname = window.location.hostname.toLowerCase();
    let configPath = '/assets/Config/BnsConfig.json'; // par défaut PROD

    // Dev local (ng serve sur localhost/127.x) : cible l'API tournant sur cette même machine
    // (localhost:4000), à distinguer du domaine de test HÉBERGÉ (testarmonys.bnsgroupe.net) qui
    // doit lui pointer vers l'API distante testarmonysapi.bnsgroupe.net — sinon un `ng serve`
    // local se met à appeler l'API distante et le backend local "ne répond plus".
    if (hostname === 'localhost' || hostname.startsWith('127.')) {
      configPath = '/assets/Config/BnsConfigLocal.json';
    } else if (
      hostname.includes('test') ||
      hostname.includes('staging') ||
      hostname.includes('local')
    ) {
      configPath = '/assets/Config/BnsConfigTest.json';
    }

    console.log('🌐 Chargement config depuis :', configPath);

    try {
      const data = await lastValueFrom(this.http.get(configPath));
      this.config = data;
      this.configLoaded = true;
    } catch (error) {
      console.error('❌ Erreur de chargement de la configuration :', error);
    }
  }

  get(key: string) {
    return this.config ? this.config[key] : null;
  }

  getAll() {
    return this.config;
  }


  get apiUrl(): string {
    console.log(this.config,'this.config')
    return this.config?.apiUrlBns;
  }
  get wsUrl(): string {
    console.log(this.config,'this.config')
    return this.config?.webSocketUrl;
  }
  get docUrl(): string {
    console.log(this.config,'this.config')
    return this.config?.docUrl;
  }
}
