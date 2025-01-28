import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseUrl = 'http://localhost:5000/api/users'; 
  // private baseUrl = 'https://chat-app-angular-backend.onrender.com/api/auth'; 

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    return this.http.post(`${this.baseUrl}/login`, loginData);
  }
}
