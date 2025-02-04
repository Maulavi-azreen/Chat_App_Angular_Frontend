import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;

  constructor() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', { autoConnect: true });

      // Listen for user status updates
      this.socket.on('userStatus', (data) => {
        console.log('Received user status update:', data);
        if (data && data.userId) {
          console.log(`User ${data.userId} is now ${data.status}`);
        }
      });
    }
  }

  // **Connect user to socket**
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

  // Listen for incoming messages

  onMessageReceived(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (message: any) => {
        if (typeof message === 'string') {
          try {
            message = JSON.parse(message); // Convert string to object
          } catch (error) {
            console.error('Error parsing message:', error);
            return;
          }
        }

        if (typeof message === 'object' && message.content) {
          console.log('Real-time message received:', message);
          observer.next(message); // Push message to the UI in real-time
        } else {
          console.error('Received invalid message format:', message);
        }
      });
    });
  }

  // Emit an event to check user status
  checkUserStatus(
    userId: string
  ): Observable<{ userId: string; status: string }> {
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

  emitTyping(senderId: string, chatId: string, senderName: string): void {
    if (!senderId || !chatId || !senderName) {
      console.warn("🚨 emitTyping called with missing data:", { senderId, chatId, senderName });
      return;
    }
  
    console.log("📤 Emitting typing event →", { chatId, senderId, senderName });
    this.socket.emit('typing', { chatId, senderId, senderName });
  }
  
  
  emitStopTyping(senderId: string, chatId: string): void {
    console.log(`🛑 Emitting stopTyping event → Chat: ${chatId}, User ID: ${senderId}`);
    this.socket.emit('stopTyping', { senderId, chatId });
  }
  
  listenForTyping(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('typing', (data) => {
        console.log(`📥 Typing event received →`, data);
        observer.next(data);
      });
    });
  }
  
  listenForStopTyping(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('stopTyping', (data) => {
        console.log(`📥 StopTyping event received →`, data);
        observer.next(data);
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
