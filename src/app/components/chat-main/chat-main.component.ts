import { Component, OnInit,NgZone } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user/user.service';
import { MessageService } from '../../service/message/message.service';
import { ChatService } from '../../service/chat/chat.service';
import { ChatNavbarComponent } from '../chat-navbar/chat-navbar.component';
import { SocketService } from '../../service/socket/socket.service';
import { Socket,io } from 'socket.io-client';


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

  selectedGroup: any = null;  // Track selected group chat

  userStatus: string = 'offline';   //user status

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private messageService: MessageService,
    private socketService: SocketService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.socket = this.socketService.getSocket();
    this.setupSocketListeners();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
           // Notify backend that this user is online
      if (this.currentUser?._id) {
        console.log(`Emitting userConnected for userId: ${this.currentUser._id}`);
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
      console.log("Received real-time message:", message);

      if (message.chatId) {
        // Ensure chat message array is initialized
        if (!this.messages[message.chatId]) {
          this.messages[message.chatId] = [];
        }

        // Check for duplicates before adding
        const existingMessage = this.messages[message.chatId].find(msg => msg._id === message._id);
        if (!existingMessage) {
          this.messages[message.chatId].push(message);
          console.log("Message added to chat:", message);
        } else {
          console.warn("Duplicate message detected, skipping:", message);
        }
      }
    });

    }
  }

  private setupSocketListeners(): void {
    this.socket.off('receiveMessage');
      this.socket.off('sendMessage'); // Clear previous listeners
    this.socket.on('receiveMessage', (message: any) => {
      this.ngZone.run(() => {  // Force Angular to detect changes
        console.log('New message received:', message);

        if (message.chat) {
          const chatId = message.chat;
          if (!this.messages[chatId]) {
            this.messages[chatId] = [];
          }

          this.messages[chatId].push(message);
          console.log(`Updated messages for chat ${chatId}:`, this.messages[chatId]);

          // If the received message belongs to the currently open chat, update UI
          if (this.selectedChat && this.selectedChat._id === chatId) {
            this.selectedChat.lastMessage = message;
          }
        }
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
      this.groups = chats.filter(chat => chat.isGroupChat);
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

          this.loadMessages(chat._id);
          this.getUserStatus(userId);  // Fetch user status when contact is selected
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
      this.getUserStatus(contact._id);  // Fetch user status when contact is selected
    }
  }
   // Handle group selection
   onGroupSelected(group: any): void {
    console.log('Group selected:', group);
  
    this.selectedGroup = group; 
    this.selectedContact = null; 
    this.selectedChat = group;
    console.log("Updated selectedGroup:", this.selectedGroup);
    console.log("Selected Chat ",this.selectedChat);

  
   
    console.log("Updated selectedChat:", this.selectedChat);
  
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
      this.editedMessage = null;  // Reset edit state
      this.repliedMessage = null;  // Reset reply state
      this.loadMessages(group._id);
    }
  }
  

  // Load the messages
  loadMessages(chatId: string): void {
    if (!chatId) {
      console.error('No chat ID provided to load messages.');
      return;
    }
  
     // Check if the chat is a group chat or an individual chat
  const isGroupChat = this.selectedChat?.isGroupChat || false;
  console.log(`Loading messages for ${isGroupChat ? 'Group' : 'Individual'} Chat:`, chatId);

  this.messageService.getMessages(chatId).subscribe({
    next: (messages) => {
      this.messages[chatId] = messages; // Store messages based on chatId
      console.log(`Messages loaded for ${isGroupChat ? 'group' : 'individual'} chat:`, messages);
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
      this.messages[chatId].push({...newMessage});
      this.editedMessageText = ''; // Clear edit mode after sending
      this.resetReplyState();  //Reset reply state
      console.log('Updated messages for chat:', this.messages[chatId]);
    }
  }
  
  
  onMessageError(errorMessage: string): void {
    console.error('Message Error:', errorMessage);
    // You can also show a toast or an alert with the error message here
  }

onEditMessage(message: any): void {
  this.editedMessage = message;  // Store message to edit
  this.editedMessageText = message.content;  // Pass content to input
}

onReplyMessage(message: any): void {
  this.repliedMessage = message;  // Store message to reply
}


resetReplyState(): void {
  this.editedMessage = null;
  this.editedMessageText = null;
}
}
