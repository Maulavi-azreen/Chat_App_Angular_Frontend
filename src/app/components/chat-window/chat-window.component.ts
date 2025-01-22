import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges,ViewChild, ElementRef } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css',
})
export class ChatWindowComponent implements OnInit, OnChanges {
  @Input() selectedChat: any; // Current chat object
  @Input() messages: { [key: string]: any[] } = {}; // Messages grouped by chatId
  @Input() selectedContact: any; // Selected contact
  @Input() currentUser: any; // Logged-in user
  messageMenuOpen: string | null = null; // To track which message menu is open
  dropdownPosition: { [messageId: string]: { top: string; left: string } } = {};


  // To scroll window as new chats are added
  @ViewChild('chatWindow') private chatWindow!: ElementRef;

  socket: Socket;
  messageText: string = ''; // For message input

  constructor() {
    this.socket = io('http://localhost:5000'); // Update the URL if needed
  }

  ngOnInit(): void {
    this.setupSocketListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedChat'] && this.selectedChat) {
      this.joinChat();
    }
  }

  ngAfterViewChecked(): void {
    // Scroll to the bottom after view has been updated
    this.scrollToBottom();
  }

  // Join a specific chat (room) based on selected chat ID
  private joinChat(): void {
    if (this.selectedChat?._id) {
      this.socket.emit('join_chat', this.selectedChat._id);
    }
  }

  // Setup listeners for socket events
  private setupSocketListeners(): void {
    // Listen for 'receive_message' event to get messages from others
    this.socket.on('receive_message', (message: any) => {
      if (message.chatId) {
        // Ensure messages for this chatId exist
        if (!this.messages[message.chatId]) {
          this.messages[message.chatId] = [];
        }
        // Append the new message
        this.messages[message.chatId].push(message);
      }
    });
  }

  // Function to send a message
  sendMessage(): void {
    if (this.selectedChat && this.messageText.trim() !== '') {
      const message = {
        chatId: this.selectedChat._id,
        senderId: this.currentUser._id,
        content: this.messageText,
        createdAt: new Date(),
      };

      // Emit the message to the server to broadcast to other users in the chat
      this.socket.emit('send_message', message);

      // Immediately add the message to the local message list to update the UI
      if (!this.messages[message.chatId]) {
        this.messages[message.chatId] = [];
      }
      this.messages[message.chatId].push(message);

      // Clear the input field after sending
      this.messageText = '';
    }
  }

   // Toggle message menu for a specific message
   toggleMessageMenu(messageId: string): void {
    // Toggle the menu for the selected message
    this.messageMenuOpen = this.messageMenuOpen === messageId ? null : messageId;
  }
  
  
  
  onEditMessage(message: any) {
    console.log('Edit message:', message);
    // Add your edit logic here
  }
  
  onDeleteMessage(message: any) {
    console.log('Delete message:', message);
    // Add your delete logic here
  }

  private scrollToBottom(): void {
    try {
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
