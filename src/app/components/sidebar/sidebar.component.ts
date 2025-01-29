import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../service/chat/chat.service';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() contacts: any[] = []; // Receive contacts from parent
  @Input() currentUser: any; // Logged-in user details passed from parent
  @Input() groups: any[] = []; // Received groups from parent

  @Output() selectedChatChange = new EventEmitter<any>(); // Emits selected chat (group or contact)
  @Output() contactSelected = new EventEmitter<any>(); // Emit selected contact to parent
  @Output() groupSelected: EventEmitter<any> = new EventEmitter(); // Added output for group selection

  searchTerm: string = ''; // For search functionality
  filteredContacts: any[] = []; // For displaying filtered users
  selectedContacts: any[] = []; // For storing selected contacts for group
  showArrow: boolean = false; // Flag to show the arrow after selection for creating groups
  isCreateGroupMode: boolean = false; // Flag to track if user is in "Create Group" mode
  groupName: string = ''; // For storing group name
  createdGroup: any = null; // To store the created group
  selectedChat: any;

  constructor(private router: Router, private chatService: ChatService) {}

  ngOnChanges(): void {
    this.filterContacts();
  }

  // For not showing loggedin username to themselves
  filterContacts(): void {
    this.filteredContacts = this.contacts.filter(
      (contact) =>
        contact._id !== this.currentUser?._id &&
        contact.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Emit selected contact to parent component or handle group selection
  selectContact(contact: any): void {
    if (this.isCreateGroupMode) {
      // In create group mode, toggle contact selection
      const index = this.selectedContacts.indexOf(contact);
      if (index > -1) {
        this.selectedContacts.splice(index, 1); // Deselect contact
      } else {
        this.selectedContacts.push(contact); // Select contact
      }
      // Show the arrow if 2 or more contacts are selected
      this.showArrow = this.selectedContacts.length >= 2;
    } else {
      // Normal contact selection
      this.contactSelected.emit(contact);
    }
  }
  // Select a group chat
  selectGroup(group: any): void {
    this.groupSelected.emit(group); // Emit the selected group
    this.selectedChat = group; // Store selected group for UI highlight
  }
  // Start creating a group
  createGroupMode(): void {
    this.isCreateGroupMode = true; // Switch to group creation mode
    if (this.selectedContacts.length === 0) {
      alert('Please select contacts to add to the group.');
    }
  }

  // Confirm group creation and send to backend
  createGroup(): void {
    if (this.selectedContacts.length < 2) {
      alert('Please select at least 2 contacts to create a group.');
      return;
    }

    const contactIds = this.selectedContacts.map((contact) => contact._id);
    const groupName = prompt('Enter a group name:');

    if (groupName) {
      this.chatService.createGroup(contactIds, groupName).subscribe(
        (response) => {
          alert('Group created successfully!');
          this.groups.push(response); // Add group to the list
          this.selectedContacts = [];
          this.isCreateGroupMode = false;
        },
        (error) => {
          alert('There was an error creating the group.');
        }
      );
    }
  }

  // Navigate to update profile page
  updateProfile(): void {
    console.log('Navigating to Update Profile');
  }

  // Logout user and redirect to login page
  logout(): void {
    localStorage.removeItem('token'); // Clear token
    console.log('Logged out successfully.');
    this.router.navigate(['/login']); // Replace with the actual login route
  }
}
