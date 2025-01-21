import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root', // Makes the service globally available
})
export class SignupService {
  private baseUrl = 'http://localhost:5000/api/auth'; // Backend API base URL

  constructor(private http: HttpClient) {}

  // Method to call the signup API
  registerUser(name: string, email: string, password: string , confirmPassword:string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // Log the data being sent to the backend
    console.log('Sending signup request with data:', {
      name,
      email,
      password,
      confirmPassword,
    });

    return this.http
      .post(
        `${this.baseUrl}/signup`,
        { name, email, password, confirmPassword },
        { headers, withCredentials: true }
      )
      .pipe(
        // Catch and handle errors
        catchError((error) => {
          console.error('Signup API error:', error); // Log error details
          // Rethrow the error for further handling
          return throwError(() => error);
        })
      );
  }
}
