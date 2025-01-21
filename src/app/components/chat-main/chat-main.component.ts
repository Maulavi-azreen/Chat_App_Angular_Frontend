import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user/user.service';
import { MessageService } from '../../service/message/message.service';
import { ChatService } from '../../service/chat/chat.service';


@Component({
  selector: 'app-chat-main',
  imports: [SidebarComponent, ChatWindowComponent, MessageInputComponent, CommonModule],
  templateUrl: './chat-main.component.html',
  styleUrls: ['./chat-main.component.css'],
})
export class ChatMainComponent implements OnInit {
  contacts: any[] = []; // All contacts fetched from the backend
  chats: any[] = []; // Existing chats fetched from the backend
  messages: { [key: string]: any[] } = {}; // Messages grouped by chatId
  selectedContact: any = null; // Currently selected contact
  selectedChat: any = null; // Currently selected chat object

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.fetchContacts();
    this.fetchChats();
  }

  // Fetch contacts
  fetchContacts(): void {
    this.userService.getAllUsers().subscribe(
      (users) => {
        this.contacts = users;
        console.log('Fetched contacts:', this.contacts); // Log contacts to ensure correct structure
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
    if (!contact.chatId) {
      const userId = contact.id || contact._id; // Use the correct property
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
      this.selectedContact = contact;
      this.selectedChat = this.chats.find((chat) => chat._id === contact.chatId);
    }
  }
  
  
  loadMessages(chatId: string): void {
    if (!this.messages[chatId] || this.messages[chatId].length === 0) {
      this.messageService.getMessages(chatId).subscribe({
        next: (messages) => {
          this.messages[chatId] = messages; // Store messages in the state
          console.log('Messages loaded:', messages);
        },
        error: (err) => console.error('Error loading messages:', err),
      });
    }
  }
  
  



  // Handle message sent
  onMessageSent(newMessage: any): void {
    if (this.selectedContact) {
      const chatId = this.selectedContact.chatId;
  
      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }
      this.messages[chatId].push(newMessage); // Add the new message to the chat
      console.log('Message sent to', this.selectedContact.name, ':', newMessage);
    }
  }
  
    
}
