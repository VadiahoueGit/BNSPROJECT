import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { catchError, filter, map, retryWhen, delay, tap, scan } from 'rxjs/operators';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class GpsWebSocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private readonly reconnectInterval = 5000; // Intervalle en ms entre tentatives
  private readonly maxReconnectAttempts = 5; // Nombre max de tentatives de reconnexion
  private connectionClosed$ = new Subject<void>(); // Pour signaler la fermeture manuelle

  constructor() {
    this.connect(); // Initialiser la connexion
  }

  private connect(): void {
    console.log('Tentative de connexion au WebSocket...');
    this.socket$ = webSocket({
      url: 'ws://wsbnsapi.monassoci.com/',
      deserializer: (msg) => {
        try {
          return JSON.parse(msg.data); // Parse le message en JSON
        } catch {
          console.warn('Message non JSON reçu, retour des données brutes.');
          return msg; // Retourne le texte brut
        }
      },
    });
    setInterval(() => {
      if( this.socket$)
      this.socket$
        .pipe(
          retryWhen((errors) =>
            errors.pipe(
              scan((retries, error) => {
                if (retries >= this.maxReconnectAttempts) {
                  console.error('Nombre maximal de tentatives atteint. Abandon.');
                  throw error; // Propager l'erreur après trop de tentatives
                }
                console.warn(`Tentative de reconnexion ${retries + 1} après une erreur :`, error);
                return retries + 1;
              }, 0),
              delay(this.reconnectInterval)
            )
          )
          ,
          catchError((err) => {
            console.error('Erreur WebSocket non récupérable :', err);
            return []; // Retourne un observable vide
          })
        )
        .subscribe({
          next: (message) => console.log('Message reçu :', message),
          complete: () => console.warn('WebSocket fermé par le serveur.'),
        });
    },1000)
  }

  // Méthode pour écouter les messages filtrés
  getCoordinates(): Observable<any> {
    if (!this.socket$) {
      throw new Error('WebSocket non initialisé.');
    }

    return this.socket$.pipe(
      filter((message: any) => message.channel === 'message'), // Filtrer par canal
      map((message: any) => message.data) // Extraire les données utiles
    );
  }

  // Vérifie si le WebSocket est connecté
  isConnected(): boolean {
    const nativeSocket = this.getNativeSocket();
    return nativeSocket ? nativeSocket.readyState === WebSocket.OPEN : false;
  }

  private getNativeSocket(): WebSocket | null {
    return (this.socket$ as any)?._socket || null;
  }

  // Méthode pour envoyer des messages
  sendMessage(message: any): void {
    if (this.isConnected() && this.socket$) {
      console.log('Message envoyé au serveur WebSocket :', message);
      this.socket$.next(message);
    } else {
      console.error('WebSocket n’est pas connecté. Message non envoyé.');
    }
  }

  // Méthode pour fermer la connexion
  closeConnection(): void {
    console.log('Fermeture de la connexion WebSocket...');
    this.connectionClosed$.next(); // Signale la fermeture
    this.socket$?.complete();
    this.socket$ = null; // Réinitialise la connexion
  }
}
