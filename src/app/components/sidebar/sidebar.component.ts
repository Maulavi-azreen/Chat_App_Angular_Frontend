import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() contacts: any[] = []; // Receive contacts from parent
  @Output() contactSelected = new EventEmitter<any>(); // Emit selected contact to parent
  @Input() currentUser: any; // Logged-in user details passed from parent

  searchTerm: string = ''; // For search functionality
  filteredContacts: any[] = []; // For displaying filtered users

  constructor(private router: Router) {}

  ngOnChanges(): void {
    this.filterContacts();
  }

  // Filter contacts based on the search term
  // filterContacts(): void {
  //   if (this.searchTerm.trim()) {
  //     this.filteredContacts = this.contacts.filter((contact) =>
  //       contact.name.toLowerCase().includes(this.searchTerm.toLowerCase())
  //     );
  //   } else {
  //     this.filteredContacts = this.contacts;
  //   }
  // }
  filterContacts(): void {
    this.filteredContacts = this.contacts.filter(
      (contact) =>
        contact._id !== this.currentUser?._id &&
        contact.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Emit selected contact to parent component
  selectContact(contact: any): void {
    this.contactSelected.emit(contact);
  }

  // Navigate to update profile page
  updateProfile(): void {
    console.log('Navigating to Update Profile');
    this.router.navigate(['/update-profile']); // Replace with the actual route
  }

  // Logout user and redirect to login page
  logout(): void {
    localStorage.removeItem('token'); // Clear token
    console.log('Logged out successfully.');
    this.router.navigate(['/login']); // Replace with the actual login route
  }
}
