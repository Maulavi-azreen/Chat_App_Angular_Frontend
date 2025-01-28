import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private apiUrl = 'http://localhost:5000/api/users'; 
  // private apiUrl = 'https://chat-app-angular-backend.onrender.com/api/notifications'; // Update with your backend URL
  private notificationsSubject = new BehaviorSubject<any[]>([]); // Store notifications in a BehaviorSubject
  notifications$ = this.notificationsSubject.asObservable(); // Observable to subscribe to notifications

  constructor(private http: HttpClient) {}

  // Fetch notifications for the logged-in user
  getNotifications(userId: string, page: number = 1, limit: number = 10, isRead?: boolean): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}&isRead=${isRead}`);
  }

  // Mark a specific notification as read
  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}`, {});
  }

  // Mark all notifications as read
  markAllAsRead(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-read`, { userId });
  }

  // Handle socket notifications for real-time updates
  handleSocketNotification(notification: any) {
    // Get the current notifications
    const currentNotifications = this.notificationsSubject.value;
    
    // Add the new notification to the array
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }

  // Add a new notification
  addNotification(notification: any) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }
}
