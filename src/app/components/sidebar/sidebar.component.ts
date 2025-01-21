import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../service/user/user.service';


@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent{
  @Input() contacts: any[] = []; // Receive contacts from parent
  @Output() contactSelected = new EventEmitter<any>(); // Emit selected contact to parent

  searchTerm: string = ''; // For search functionality
  filteredContacts: any[] = []; // For displaying filtered users

  ngOnChanges(): void {
    // Update filteredContacts whenever contacts input changes
    this.filteredContacts = this.contacts;
  }

  // Filter contacts based on the search term
  filterContacts(): void {
    if (this.searchTerm.trim()) {
      this.filteredContacts = this.contacts.filter((contact) =>
        contact.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredContacts = this.contacts;
    }
  }

  // Emit selected contact to parent component
  selectContact(contact: any): void {
    this.contactSelected.emit(contact); // Notify parent of the selected contact
  }
}
