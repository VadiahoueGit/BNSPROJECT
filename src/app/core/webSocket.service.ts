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
  private socket: WebSocket;
  private messageSubject: Subject<any> = new Subject<any>();

  constructor() {
   
  }

  openConnection(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connecté');
    };

    // Écouter les messages entrants
    this.socket.onmessage = (event: MessageEvent) => {
      this.messageSubject.next(event.data);  // Emmettre le message via un Observable
    };

    this.socket.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket fermé');
    };
  }

  // Envoyer un message au serveur
  sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.warn('La connexion WebSocket n\'est pas ouverte');
    }
  }

  // Retourner un Observable qui émet les messages entrants
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // Fermer la connexion
  closeConnection(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}

