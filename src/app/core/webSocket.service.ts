import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import {io, Socket} from "socket.io-client";

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;
  private readonly SERVER_URL = 'wss://c2c2-160-155-133-247.ngrok-free.app';

  constructor() {

    this.socket = io(this.SERVER_URL,{
      transports: ['websocket'],
      path: '/socket.io'
    });
  }

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }

  onMessage(callback: (data: string) => void): void {
    console.log('Tentative de WebSocket...',callback)
    this.socket.on('message', callback);
  }



// Écouter un canal (événement)
  ecouterNouveauMessage(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('message', (data: string) => {
        observer.next(data);
      });
    });
  }
  // reconnect(): void {
  //   console.log('Tentative de reconnexion WebSocket...');
  //   if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
  //     this.connect('ws://localhost:8080'); // Reconnecter le WebSocket
  //   }
  // }
}
