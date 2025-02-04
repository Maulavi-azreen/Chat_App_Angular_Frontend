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

  // **Send a message (real-time)**
  // sendMessage(
  //   senderId: string,
  //   receiverId: string,
  //   message: string,
  //   chatId: string
  // ): void {
  //   if (!senderId || !receiverId || !message || !chatId) {
  //     console.error('Missing parameters for sending message.');
  //     return;
  //   }

  //   const msgData = { senderId, receiverId, message, chatId };

  //   this.socket.emit(
  //     'sendMessage',
  //     msgData,
  //     (ack: { success: boolean; error?: string }) => {
  //       if (!ack.success) {
  //         console.error('Error sending message:', ack.error);
  //       }
  //     }
  //   );

  //   console.log('Message sent:', msgData);
  // }

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

  // Disconnect the socket when needed
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket disconnected');
    }
  }
}
