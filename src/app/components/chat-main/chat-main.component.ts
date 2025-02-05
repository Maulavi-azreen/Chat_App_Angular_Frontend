import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user/user.service';
import { MessageService } from '../../service/message/message.service';
import { ChatService } from '../../service/chat/chat.service';
import { ChatNavbarComponent } from '../chat-navbar/chat-navbar.component';
import { SocketService } from '../../service/socket/socket.service';
import { Socket, io } from 'socket.io-client';

@Component({
  selector: 'app-chat-main',
  imports: [
    SidebarComponent,
    ChatWindowComponent,
    MessageInputComponent,
    CommonModule,
    ChatNavbarComponent,
  ],
  templateUrl: './chat-main.component.html',
  styleUrl: './chat-main.component.css',
})
export class ChatMainComponent implements OnInit {
  socket!: Socket;
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

  // Track edited message
  editedMessage: any = null;
  repliedMessage: any = null;
  editedMessageText: any = null;

  groups: any[] = []; // Filtered group chats to be passed to Sidebar

  selectedGroup: any = null; // Track selected group chat

  userStatus: string = 'offline'; //user status

  typingIndicatorVisible = false; // This will control the visibility of the typing indicator
  typingUser: string = ''; // This will store the name of the typing user
  typingTimeout: any;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private messageService: MessageService,
    private socketService: SocketService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.socket = this.socketService.getSocket();
    this.setupSocketListeners();
    // 🔹 Listen for "typing" event from another user
    this.socketService.listenForTyping().subscribe((data: any) => {
      this.ngZone.run(() => {
        if (
          data.chatId === this.selectedChat?._id &&
          data.senderId !== this.currentUser._id
        ) {
          this.typingUser = data.senderName;
          this.typingIndicatorVisible = true;
          console.log(`✏️ ${data.senderName} is typing...`);

          // Hide typing indicator after inactivity
          clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => {
            this.typingIndicatorVisible = false;
            this.cdr.detectChanges();
          }, 5000);
        }
      });
    });

    // 🔹 Listen for "stopTyping" event from another user
    this.socketService.listenForStopTyping().subscribe((data: any) => {
      this.ngZone.run(() => {
        if (
          data.chatId === this.selectedChat?._id &&
          data.senderId !== this.currentUser._id
        ) {
          this.typingIndicatorVisible = false;
          console.log(`🛑 ${data.senderId} stopped typing`);
          this.cdr.detectChanges();
        }
      });
    });

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        // Notify backend that this user is online
        if (this.currentUser?._id) {
          console.log(
            `Emitting userConnected for userId: ${this.currentUser._id}`
          );
          this.socket.emit('userConnected', this.currentUser._id);
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }

    if (this.currentUser?._id) {
      this.fetchContacts();
      // Subscribe to chat deletion event
      this.chatService.chatRefresh$.subscribe(() => {
        this.fetchChats();
      });
      // Subscribe to real-time messages (Preventing Duplicates)
      this.socketService.onMessageReceived().subscribe((message) => {
        console.log('Received real-time message:', message);

        if (message.chatId) {
          // Ensure chat message array is initialized
          if (!this.messages[message.chatId]) {
            this.messages[message.chatId] = [];
          }

          // Check for duplicates before adding
          const existingMessage = this.messages[message.chatId].find(
            (msg) => msg._id === message._id
          );
          if (!existingMessage) {
            this.messages[message.chatId].push(message);
            console.log('Message added to chat:', message);
          } else {
            console.warn('Duplicate message detected, skipping:', message);
          }
        }
      });
    }
  }

  private setupSocketListeners(): void {
    console.log('📡 Setting up socket listeners...');
    this.socket.off('receiveMessage'); // Remove previous listeners to prevent duplicates
    this.socket.on('receiveMessage', (message: any) => {
      this.ngZone.run(() => {
        // Ensure Angular detects changes
        console.log('New message received:', message);

        const chatId = message.chat._id || message.chat; // Ensure correct chat ID

        if (!this.messages[chatId]) {
          this.messages[chatId] = []; // Initialize messages array if not present
        }

        // **Check for duplicates before adding**
        const existingMessage = this.messages[chatId].find(
          (msg) => msg._id === message._id
        );
        if (!existingMessage) {
          this.messages[chatId].push(message);
          console.log('Message added to chat:', message);
        } else {
          console.warn('Duplicate message detected, skipping:', message);
        }

        // **Update last message in chat if it's the selected one**
        if (this.selectedChat && this.selectedChat._id === chatId) {
          this.selectedChat.lastMessage = message;
        }

        this.cdr.detectChanges(); // **Manually trigger UI update**
      });
    });
  }

  // Fetch contacts
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
        // Filter out group chats
        this.groups = chats.filter((chat) => chat.isGroupChat);
        chats.forEach((chat) => {
          if (!this.messages[chat._id]) {
            this.messages[chat._id] = []; // Initialize messages array for each chat
          }
        });
      },
      error: (error) => console.error('Error fetching chats:', error),
    });
  }

  getUserStatus(userId: string): void {
    console.log(`Requesting status for user: ${userId}`);
    this.socketService.checkUserStatus(userId).subscribe({
      next: (status) => {
        console.log('Status received:', status);
        this.userStatus = status.status;
      },
      error: (err) => console.error('Error fetching user status:', err),
    });
  }

  // Handle contact selection
  onContactSelected(contact: any): void {
    console.log('Selected contact in ChatMain:', contact); // Log selected contact
    this.selectedGroup = null; // Reset selected group
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

          // ✅ 🔹 Ensure user joins chat when chat is selected
          if (this.selectedChat?._id) {
            console.log(`🔹 Joining chat room: ${this.selectedChat?._id}`);
            this.socket.emit('joinChat', {
              chatId: this.selectedChat._id,
              userId: this.currentUser._id,
            });
          }
          this.loadMessages(chat._id);
          this.getUserStatus(userId); // Fetch user status when contact is selected
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
      this.getUserStatus(contact._id); // Fetch user status when contact is selected
    }
  }
  // Handle group selection
  onGroupSelected(group: any): void {
    console.log('Group selected:', group);

    this.selectedGroup = group;
    this.selectedContact = null;
    this.selectedChat = group;
    console.log('Updated selectedGroup:', this.selectedGroup);
    console.log('Selected Chat ', this.selectedChat);

    console.log('Updated selectedChat:', this.selectedChat);

    // Check if group already exists or needs to be created
    if (!group._id) {
      console.log('Group does not exist, creating a new one.');

      // Example of creating a group with selected users
      if (group.members && group.members.length > 0) {
        const selectedUserIds = group.members.map((member: any) => member._id);
        const groupName = group.name || 'New Group';

        console.log('Creating group with users:', selectedUserIds);
        console.log('Group name:', groupName);

        this.chatService.createGroup(selectedUserIds, groupName).subscribe({
          next: (response) => {
            console.log('Group created successfully:', response);
            // Update the selected group with the newly created group data
            this.selectedGroup = response;
            this.selectedChat = response;
            this.loadMessages(response._id);
          },
          error: (error) => {
            console.error('Error creating group:', error);
          },
        });
      } else {
        console.error('No members available to create the group.');
      }
    } else {
      console.log('Group already exists, loading messages.');
      this.editedMessage = null; // Reset edit state
      this.repliedMessage = null; // Reset reply state
      this.loadMessages(group._id);
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
        this.messages[chatId] = messages; // Store messages based on chatId
        console.log('Messages loaded for chat:', messages);
      },
      error: (err) => {
        console.error('Error loading messages:', err);
      },
    });
  }

  // Handle message sent for new msg and edited msg
  //triggered when a message is sent in the child component ie in chat window through message input

  onMessageSent(newMessage: any): void {
    if (this.selectedContact) {
      const chatId = this.selectedContact.chatId;

      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }
      this.messages[chatId].push({ ...newMessage });
      this.editedMessageText = ''; // Clear edit mode after sending
      this.resetReplyState(); //Reset reply state
      console.log('Updated messages for chat:', this.messages[chatId]);
    }
  }

  onMessageError(errorMessage: string): void {
    console.error('Message Error:', errorMessage);
    // You can also show a toast or an alert with the error message here
  }

  onEditMessage(message: any): void {
    this.editedMessage = message; // Store message to edit
    this.editedMessageText = message.content; // Pass content to input
  }

  onReplyMessage(message: any): void {
    this.repliedMessage = message; // Store message to reply
  }

  resetReplyState(): void {
    this.editedMessage = null;
    this.editedMessageText = null;
  }
}
