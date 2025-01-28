import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  //Rename a group chat
  renameGroupChat(chatId:string, chatName: string): Observable<any>{
    const headers=new HttpHeaders({'Content-Type':'application/json'});
    const body={
      chatId , chatName
    };
    return this.http.put(`${this.apiUrl}/group/rename`, body , {headers});
  }

  //delete messages for a chat
  deleteChatForUser(chatId:string):Observable<any>{
    const headers=new HttpHeaders({'Content-Type':'application/json'});
    const body={
      chatId
    };
    return this.http.delete(`${this.apiUrl}/user/delete/message`, {body,headers});
  }
}
