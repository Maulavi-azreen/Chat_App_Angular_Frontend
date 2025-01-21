import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/chat';

  constructor(private http: HttpClient) {}

  // Create Chat
  createChat(userId: string): Observable<any> {
    const url = `${this.apiUrl}`; // Ensure this matches your backend route
    console.log("User Id",userId);
    const body = { userId }; // Include userId in the body
    return this.http.post<any>(url, body);
  }
  

  // Fetch Chats
  fetchChats(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  
}
