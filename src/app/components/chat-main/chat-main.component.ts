import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user/user.service';
import { MessageService } from '../../service/message/message.service';
import { ChatService } from '../../service/chat/chat.service';
import { ChatNavbarComponent } from '../chat-navbar/chat-navbar.component';

@Component({
  selector: 'app-chat-main',
  imports: [
    SidebarComponent,
    ChatWindowComponent,
    MessageInputComponent,
    CommonModule,
    ChatNavbarComponent
  ],
  templateUrl: './chat-main.component.html',
  styleUrl: './chat-main.component.css',
})
export class ChatMainComponent implements OnInit {
   // All contacts fetched from the backend
  contacts: any[] = [];

  // Existing chats fetched from the backend
  chats: any[] = []; 

  // Messages grouped by chatId
  messages: { [key: string]: any[] } = {};

  // Currently selected contact
  selectedContact: any = null; 

  // Currently selected chat object
  selectedChat: any = null; 

  // Store logged-in user details
  currentUser: any; 

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        this.currentUser = null; // Fallback in case of parsing error
      }
    } else {
      console.error('No user found in localStorage');
      this.currentUser = null;
    }
  
    if (this.currentUser?._id) {
      this.fetchContacts();
      this.fetchChats();
    } else {
      console.error('Invalid user data. Ensure the user is logged in.');
    }
  }
  

  // Fetch contacts
  // fetchContacts(): void {
  //   this.userService.getAllUsers().subscribe(
  //     (users) => {
  //       this.contacts = users;
  //       console.log('Fetched contacts:', this.contacts); // Log contacts to ensure correct structure
  //     },
  //     (error) => {
  //       console.error('Error fetching contacts:', error);
  //     }
  //   );
  // }
  fetchContacts(): void {
    this.userService.getAllUsers().subscribe(
      (users: any[]) => {
        // Filter out the current user from the list of contacts
        this.contacts = users.filter(
          (user) => user._id !== this.currentUser?._id
        );
        console.log('Filtered contacts:', this.contacts); // Log filtered contacts
      },
      (error) => {
        console.error('Error fetching contacts:', error);
      }
    );
  }

  // Fetch chats
  fetchChats(): void {
    this.chatService.fetchChats().subscribe({
      next: (chats) => {
        this.chats = chats;
        chats.forEach((chat) => {
          if (!this.messages[chat._id]) {
            this.messages[chat._id] = []; // Initialize messages array for each chat
          }
        });
      },
      error: (error) => console.error('Error fetching chats:', error),
    });
  }

  // Handle contact selection
  onContactSelected(contact: any): void {
    console.log('Selected contact in ChatMain:', contact); // Log selected contact
    console.log("Chat Id for selected Contact",contact.chatId);
    if (!contact.chatId) {
      const userId = contact._id; // Use the correct property
      if (!userId) {
        console.error('No userId found for selected contact:', contact);
        return;
      }

      this.chatService.createChat(userId).subscribe({
        next: (chat) => {
          contact.chatId = chat._id; // Assign the new chat ID to the contact

          this.chats.push(chat); // Add the new chat to the list of chats

          this.messages[chat._id] = []; // Initialize messages array for the new chat

          this.selectedContact = contact; // Set the selected contact

          this.selectedChat = chat; // Set the selected chat

          this.loadMessages(chat._id);
          console.log('New chat created:', chat);
        },
        error: (err) => {
          console.error('Error creating chat:', err);
        },
      });
    } else {
       // If the chat already exists, just load the messages
      this.selectedContact = contact;
      this.selectedChat = this.chats.find(
        (chat) => chat._id === contact.chatId
      );
      this.loadMessages(contact.chatId);
    }
  }

  // Load the messages
  loadMessages(chatId: string): void {
    if (!chatId) {
      console.error('No chat ID provided to load messages.');
      return;
    }
  
    this.messageService.getMessages(chatId).subscribe({
      next: (messages) => {
        this.messages[chatId] = messages; // Store messages for this chat
        console.log('Messages loaded:', messages);
      },
      error: (err) => {
        console.error('Error loading messages:', err);
      },
    });
  }


  // Handle message sent
  onMessageSent(newMessage: any): void {
    if (this.selectedContact) {
      const chatId = this.selectedContact.chatId;

      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }
      this.messages[chatId].push(newMessage); // Add the new message to the chat
      console.log('Updated messages for chat:', this.messages[chatId]);
      console.log(
        'Message sent to',
        this.selectedContact.name,
        ':',
        newMessage
      );
    }
  }
}
