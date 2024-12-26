import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: WebSocket;
  private subject: Subject<any> = new Subject<any>();

  constructor() {}

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      console.log('Message reçu :', event.data);  // Ajoutez ce log
      try {
        const message = event.data;  // Si la réponse est en JSON
        this.subject.next(message);
      } catch (error) {
        console.error('Erreur lors du parsing du message :', error);
        this.subject.next(event.data); // Si ce n'est pas du JSON, on envoie les données brutes
      }
    };

    // this.socket.onmessage = (event: MessageEvent) => {
    //   // Transmettre les données du message reçu à nos abonnés
    //   this.subject.next(event.data);
    //   // this.subject.next(JSON.parse(event.data));
    // };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Message envoyé :', message);  // Log du message envoyé
      this.socket.send(JSON.stringify(message));  // Envoi du message au serveur
    } else {
      this.reconnect()
      console.error('La connexion WebSocket n\'est pas ouverte');
    }
  }

  getMessages(): Observable<any> {
    return this.subject.asObservable();
  }

  closeConnection(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  reconnect(): void {
    console.log('Tentative de reconnexion WebSocket...');
    if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
      this.connect('ws://localhost:8080'); // Reconnecter le WebSocket
    }
  }
}
