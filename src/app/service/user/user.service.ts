// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // private apiUrl = 'http://localhost:5000/api/users'; 
  private apiUrl = 'https://chat-app-angular-backend.onrender.com/api/users'; 

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllUsers`);
  }

  sendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/otp-generate`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, newPassword });
  }

}
