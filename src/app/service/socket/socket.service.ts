import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  constructor() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', { autoConnect: true }); // Prevent auto connection
    }
       // Listen for the userStatus event to handle updates on user status (online/offline)
       this.socket.on('userStatus', (data) => {
        console.log("Received user status update:", data);
        // Here you can perform actions like updating user status in your application state
        // For example, log the userId and their status
        if (data && data.userId) {
          console.log(`User ${data.userId} is now ${data.status}`);
        }
      });
    }

  

  connect(userId: string): void {
    if (!this.socket.connected) {
      this.socket.connect();
      console.log('Socket connected:', this.socket.connected);
      this.socket.emit('userConnected', userId);
      console.log(`Emitted userConnected event for user: ${userId}`); 
    }
  }

  getSocket(): Socket {
    return this.socket;
  }
  
     // Emit an event to check user status
  checkUserStatus(userId: string): Observable<{ userId: string; status: string }> {
    return new Observable((observer) => {
      this.socket.emit('checkUserStatus', userId);
      console.log(`Requesting status for user ${userId}`);
      this.socket.on('userStatus', (data) => {
        // Log the data received to confirm if the status is being returned correctly
        console.log('Status response received:', data);
        
        if (data.userId === userId) {
          observer.next(data);
          observer.complete();
        }
      });
    });
  }

  // Disconnect the socket when needed
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket disconnected');
    }
  }
}
