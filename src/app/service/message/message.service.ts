import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {

  private apiUrl = 'http://localhost:5000/api/message'; 
  // private apiUrl = 'https://chat-app-angular-backend.onrender.com/api/message'; // Update with your backend URL

  constructor(private http: HttpClient, private socketService:SocketService) {}

     // **Send a message (Real-time + API call)**
  sendMessage(content: string, chatId: string, senderId: string, receiverId: string): Observable<any> {
    if (!content || !chatId || !senderId || !receiverId) {
      throw new Error('Content, chatId, senderId, and receiverId are required');
    }

    // First, send the message in real-time
    this.socketService.sendMessage(senderId, receiverId, content, chatId);

    // Then, store the message in the database
    return this.http.post(this.apiUrl, { content, chatId });
  }

  // **Get messages for a specific chat**
  getMessages(chatId: string): Observable<any> {
    console.log(`Fetching messages for chatId: ${chatId}`);
    return this.http.get(`${this.apiUrl}/${chatId}`);
  }

  // **Listen for real-time incoming messages**
  receiveMessages(): Observable<any> {
    return this.socketService.receiveMessages();
  }
  // Fetch message by ID
  getMessageById(messageId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${messageId}`);
  }

  // Edit a message
  editMessage(messageId: string, content: string): Observable<any> {
    if (!messageId || !content) {
      throw new Error('MessageId and content are required');
    }
    return this.http.put(`${this.apiUrl}/edit/${messageId}`, { content });
  }

  // Delete a message
  deleteMessage(chatId: string, messageId: string): Observable<any> {
    if (!chatId || !messageId) {
      throw new Error('ChatId and messageId are required');
    }
    return this.http.delete(`${this.apiUrl}/delete/${chatId}/${messageId}`, {});
  }

  // Reply to a message
  replyToMessage(messageId: string, content: string, chatId: string): Observable<any> {
    if (!messageId || !content || !chatId) {
      throw new Error('MessageId, content, and chatId are required');
    }
    return this.http.post(`${this.apiUrl}/reply/${messageId}`, { content, chatId });
  }

  // React to a message
  reactToMessage(messageId: string, emoji: string): Observable<any> {
    if (!messageId || !emoji) {
      throw new Error('MessageId and emoji are required');
    }
    return this.http.post(`${this.apiUrl}/react/${messageId}`, { emoji });
  }
}

