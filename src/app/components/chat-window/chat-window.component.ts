import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { MessageService } from '../../service/message/message.service';
import { ChatService } from '../../service/chat/chat.service';

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
  @Output() editMessage = new EventEmitter<any>(); // EventEmitter for emitting message edit event
  @Output() replyMessage = new EventEmitter<any>(); // EventEmitter for emitting message replies event
  @Output() clearMessages = new EventEmitter<void>(); // Notify parent component about clearing messages


  socket: Socket;
  messageText: string = ''; // For message input
  replyText: string = ''; // For reply input
  currentReaction: string = ''; // Selected reaction for message
  messageBeingEdited: any = null; // Track message being edited
  messageBeingRepliedTo:any=null;
  repliedMessages: any[] = [];

  // To scroll window as new chats are added
  @ViewChild('chatWindow') private chatWindow!: ElementRef;

  constructor(private messageService: MessageService,private chatService: ChatService) {
    this.socket = io('http://localhost:5000'); // Update the URL if needed
  }

  ngOnInit(): void {
    this.setupSocketListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['selectedChat'] && this.selectedChat) {
    //   this.joinChat();
    // }
    if (changes['selectedChat'] && this.selectedChat) {
      if (this.selectedChat?.isGroupChat || this.selectedChat?.participants) {
        console.log('Group chat detected');
      }
      this.joinChat();
    }
  }

  ngAfterViewChecked(): void {
    // Scroll to the bottom after view has been updated
    this.scrollToBottom();
  }

  // Joining a group chat or one-on-one chat
  private joinChat(): void {
    if (this.selectedChat?._id) {
      console.log(`Joining chat ID: ${this.selectedChat._id}`);
      this.socket.emit('join_chat', this.selectedChat._id);
    }
  }

  // Setup listeners for socket events
  private setupSocketListeners(): void {
    // Listen for 'receive_message' event to get messages from others
    this.socket.on('receive_message', (message: any) => {
      if (message.chatId && !message.isDeleted) { // Ignore deleted messages
        if (!this.messages[message.chatId]) {
          this.messages[message.chatId] = [];
        }
        this.messages[message.chatId].push(message);
        this.scrollToBottom();
      }
    });
  }

   // Function to send a message in both individual and group chats
   sendMessage(): void {
    if (this.selectedChat && this.messageText.trim() !== '') {
      const message = {
        chatId: this.selectedChat._id,
        senderId: this.currentUser._id,
        content: this.messageText,
        createdAt: new Date(),
        repliedTo: this.messageBeingRepliedTo 
          ? { _id: this.messageBeingRepliedTo._id, content: this.messageBeingRepliedTo.content } 
          : null,
      };

      if (this.messageBeingEdited) {
        this.messageService.editMessage(this.messageBeingEdited._id, this.messageText).subscribe(
          (response) => {
            console.log('Message edited:', response);
            const updatedMessage = this.messages[this.selectedChat._id].find(
              (msg) => msg._id === this.messageBeingEdited._id
            );
            if (updatedMessage) {
              updatedMessage.content = `${this.messageText} (Edited)`;
            }
            this.resetEditState();
          },
          (error) => {
            console.error('Error editing message:', error);
          }
        );
      } else {
        // Emit the message for individual or group chat
        this.socket.emit('send_message', message);

        if (!this.messages[message.chatId]) {
          this.messages[message.chatId] = [];
        }
        this.messages[message.chatId].push(message);
      }

      this.messageText = '';
    }
  }

  // Start editing a message
  onEditMessage(message: any): void {
    // Create a deep copy of the message to avoid modifying the original reference
    this.messageBeingEdited = { ...message };

    // Populate the input field with the existing message content
    this.messageText = message.content;

    // Emit the message to notify the parent component (optional)
    this.editMessage.emit(this.messageBeingEdited);

   // Add "Edited" tag locally without modifying the original object
  const messageToEdit = this.messages[this.selectedChat._id].find(msg => msg._id === message._id);
  if (messageToEdit && !messageToEdit.content.includes('(Edited)')) {
    messageToEdit.content += ' (Edited)';
  }
  }
  cancelEdit(): void {
    this.resetEditState();
  }

  // Reset the edit state
  resetEditState(): void {
    this.messageText = '';
    this.messageBeingEdited = null;
  }


  // Confirm before deleting a message
confirmDeleteMessage(message: any): void {
  if (confirm('Are you sure you want to delete this message?')) {
    this.onDeleteMessage(message);
  }
}
onDeleteMessage(message: any): void {
  this.messageService.deleteMessage(this.selectedChat._id,message._id).subscribe({
    next: () => {
      // Remove the message from the UI
      this.messages[this.selectedChat._id] = this.messages[this.selectedChat._id].filter(
        (msg) => msg._id !== message._id
      );
      
    },
    error: (err) => {
      console.error('Failed to delete message:', err);
    }
  });
}

 // Reply to a message
 onReplyMessage(message: any): void {
  this.messageBeingRepliedTo = {
    _id: message._id,
    sender: message.sender,
    content: message.content,  // Correctly setting the content here
    createdAt: message.createdAt
  };
  console.log("Message Being Replied To",this.messageBeingRepliedTo);

  // Optionally show a message preview
  this.messageText = `Replying to: "${message.content}"`;

  // Emit event to parent component with the correct data structure
  this.replyMessage.emit(this.messageBeingRepliedTo);
}
populateReplyContent(): void {
  this.repliedMessages.forEach((message) => {
    if (typeof message.replyTo === 'string') {
      this.messageService.getMessageById(message.replyTo).subscribe((reply) => {
        message.replyTo = reply;  // Replace ID with the full message object
      });
    }
  });
}

// React to a message
onReactMessage(message: any): void {
  const emoji = prompt('Enter an emoji:');
  if (emoji) {
    this.messageService.reactToMessage(message._id, emoji).subscribe({
      next: () => {
        message.reaction = emoji;
      },
      error: (err) => {
        console.error('Error reacting to message:', err);
      }
    });
  }
}

 // Function to soft-delete all messages for a user in a chat
 deleteMessagesForUser(): void {
  if (this.selectedChat && this.currentUser) {
    if (confirm('Are you sure you want to delete all messages for yourself in this chat?')) {
      this.chatService.deleteChatForUser(this.selectedChat._id).subscribe({
        next: () => {
          // Remove the messages for the user locally
          this.messages[this.selectedChat._id] = [];
          this.clearMessages.emit(); // Notify parent component if needed
          console.log('All messages deleted (soft delete) for the user.');
        },
        error: (err) => {
          console.error('Failed to delete messages:', err);
        },
      });
    }
  }
}

onDeleteChat(): void {
  if (this.selectedChat && this.currentUser) {
    if (confirm('Are you sure you want to delete all your messages in this chat?')) {
      this.chatService.deleteChatForUser(this.selectedChat._id).subscribe({
        next: () => {
          // Clear messages locally for the user in the selected chat
          this.messages[this.selectedChat._id] = [];
          console.log('All messages deleted (soft delete) for the user.');
        },
        error: (err) => {
          console.error('Failed to delete messages:', err);
        },
      });
    }
  } else {
    console.error('No chat selected or user not found.');
  }
}

  private scrollToBottom(): void {
    try {
      this.chatWindow.nativeElement.scrollTop =
        this.chatWindow.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
