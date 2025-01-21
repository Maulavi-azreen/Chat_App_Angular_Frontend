import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = 'http://localhost:5000/api/message'; // Update with your backend URL

  constructor(private http: HttpClient) {}

    // Send a message to a chat
    sendMessage(content: string, chatId: string): Observable<any> {
      if (!content || !chatId) {
        throw new Error('Content and chatId are required');
      }
  
      return this.http.post(this.apiUrl, { content, chatId });
    }
   // Get messages for a specific chat
   getMessages(chatId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${chatId}`);
  }
}
