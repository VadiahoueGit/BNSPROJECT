import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: any;
  private configLoaded = false;
  constructor(private http: HttpClient) {}
  loadConfig(): Promise<void> {
    if (this.configLoaded) {
      return Promise.resolve();
    }
    return this.http
      .get('/assets/Config/BnsConfig.json')
      .toPromise()
      .then((data) => {
        this.config = data;
        this.configLoaded = true;
      });
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
