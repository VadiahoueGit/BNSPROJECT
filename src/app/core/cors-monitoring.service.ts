import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { interval, EMPTY } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import {ConfigService} from "./config-service.service";

@Injectable({
  providedIn: 'root'
})
export class CorsMonitorService {

  private readonly PING_URL = '/api/health'; // endpoint simple
  apiUrl=''
  constructor(private http: HttpClient,private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl
  }

  playSound() {
    const audio = new Audio();
    audio.src = 'assets/sound/alarm.mp3';
    audio.load();
    audio.play();
  }
  startMonitoring() {
    // this.playSound()
    interval(2000)
      .pipe(
        switchMap(() =>
          this.http.get(`${this.apiUrl}/v1/prix?paginate=${true}&page=${1}&limit=${1}`).pipe(

            catchError((error: HttpErrorResponse) => {
              if (error.status === 0) {
                this.playSound()
                console.error('⚠️ Probable erreur CORS détectée', error);
              }
              return EMPTY; // évite l'arrêt du polling
            })
          )
        )
      )
      .subscribe();
  }
}
