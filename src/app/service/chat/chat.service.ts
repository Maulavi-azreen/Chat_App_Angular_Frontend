import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private apiUrl = 'http://localhost:5000/api/chat'; 
  // private apiUrl = 'https://chat-app-angular-backend.onrender.com/api/chat';

  constructor(private http: HttpClient) {}

  

  // Create Chat
  createChat(userId: string): Observable<any> {
    const url = `${this.apiUrl}`; // Ensure this matches your backend route
    console.log("User Id",userId);
    const body = { userId }; // Include userId in the body
    return this.http.post<any>(url, body);
  }
  

  // Fetch all chats (both group and individual) for the logged-in user
  fetchChats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fetch-chats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure you're passing the correct token
      },
    });
  }

   // Create Group Chat
   createGroup(users: string[], chatName: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      users: JSON.stringify(users),
      chatName: chatName,
    };
    return this.http.post(`${this.apiUrl}/group`, body, { headers });
  }

  //Rename a chat (both group and individual)
  renameChat(chatId: string, chatName: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { chatId, chatName };
  
    return this.http.put(`${this.apiUrl}/rename`, body, { headers });
  }

  //delete messages for a chat
  deleteChatForUser(chatId:string):Observable<any>{
    console.log("Chat id",chatId);
    const headers=new HttpHeaders({'Content-Type':'application/json'});
    return this.http.delete(`${this.apiUrl}/user/delete/message/${chatId}`, {headers});
  }
    // to refresh chats after deleting and we are calling fetch chats in chat navbar which is created in chat main component
  private chatRefreshSubject = new Subject<void>();

  chatRefresh$ = this.chatRefreshSubject.asObservable(); // Observable to subscribe

  notifyChatDeleted(): void {
    this.chatRefreshSubject.next();  // Emit event
  }
}
