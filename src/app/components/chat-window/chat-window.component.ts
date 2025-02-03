import { CommonModule } from '@angular/common';
import {Component,Input,EventEmitter,Output,OnInit} from '@angular/core';
import {Socket} from 'socket.io-client';
import { MessageService } from '../../service/message/message.service';
import { ChatService } from '../../service/chat/chat.service';
import { SocketService } from '../../service/socket/socket.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css',
})
export class ChatWindowComponent {
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
  messageBeingRepliedTo: any = null;
  repliedMessages: any[] = [];
  chats : any[]=[];


  constructor(
    private messageService: MessageService,
    private chatService : ChatService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) {
    this.socket = this.socketService.getSocket();
  }

  // Function to send a message in both individual and group chats
  // sendMessage(): void {
  //   if (!this.selectedChat || !this.messageText.trim()) {
  //     console.warn('No chat selected or empty message.');
  //     return;
  //   }
  
  //   const chatId = this.selectedChat._id;
  //   const receiverId = this.getReceiverId();
  
  //   if (!chatId || !receiverId) {
  //     console.error('Invalid chat or receiver ID.');
  //     return;
  //   }
  
  //   const message = {
  //     chatId: chatId,
  //     senderId: this.currentUser._id,
  //     receiverId: receiverId,
  //     content: this.messageText,
  //     createdAt: new Date(),
  //     repliedTo: this.messageBeingRepliedTo
  //       ? {
  //           _id: this.messageBeingRepliedTo._id,
  //           content: this.messageBeingRepliedTo.content,
  //         }
  //       : null,
  //   };
  
  //   if (this.messageBeingEdited) {
  //     // Handle editing logic
  //     this.messageService.editMessage(this.messageBeingEdited._id, this.messageText).subscribe({
  //       next: () => {
  //         this.socketService.sendMessage(
  //           message.senderId,
  //           message.receiverId,
  //           `${this.messageText} (Edited)`,
  //           message.chatId
  //         );
  //         this.resetEditState();
  //       },
  //       error: (error) => console.error('Error editing message:', error),
  //     });
  //   } else {
  //     // **Send message using SocketService but DON'T update UI manually**
  //     this.socketService.sendMessage(
  //       message.senderId,
  //       message.receiverId,
  //       message.content,
  //       message.chatId
  //     );
  //   }
  
  //   // Reset input fields
  //   this.messageText = '';
  //   this.messageBeingRepliedTo = null; // Clear reply state
  // }
  
    
    // **Helper function to get receiverId based on chat type**
  // private getReceiverId(): string {
  //   if (this.selectedChat.isGroupChat) {
  //     return this.selectedChat._id; // For group chats, the receiver is the group itself
  //   } else {
  //     return this.selectedChat.participants.find(
  //       (participant: any) => participant._id !== this.currentUser._id
  //     )?._id;
  //   }
  // }

  // Start editing a message
  onEditMessage(message: any): void {
    // Create a deep copy of the message to avoid modifying the original reference
    this.messageBeingEdited = { ...message };

    // Populate the input field with the existing message content
    this.messageText = message.content;

    // Emit the message to notify the parent component (optional)
    this.editMessage.emit(this.messageBeingEdited);

    // Add "Edited" tag locally without modifying the original object
    const messageToEdit = this.messages[this.selectedChat._id].find(
      (msg) => msg._id === message._id
    );
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
    this.messageService
      .deleteMessage(this.selectedChat._id, message._id)
      .subscribe({
        next: () => {
          // Remove the message from the UI
          this.messages[this.selectedChat._id] = this.messages[
            this.selectedChat._id
          ].filter((msg) => msg._id !== message._id);
        },
        error: (err) => {
          console.error('Failed to delete message:', err);
        },
      });
  }

  // Reply to a message
  onReplyMessage(message: any): void {
    this.messageBeingRepliedTo = {
      _id: message._id,
      sender: message.sender,
      content: message.content, // Correctly setting the content here
      createdAt: message.createdAt,
    };
    console.log('Message Being Replied To', this.messageBeingRepliedTo);

    // Optionally show a message preview
    this.messageText = `Replying to: "${message.content}"`;

    // Emit event to parent component with the correct data structure
    this.replyMessage.emit(this.messageBeingRepliedTo);
  }
  populateReplyContent(): void {
    this.repliedMessages.forEach((message) => {
      if (typeof message.replyTo === 'string') {
        this.messageService
          .getMessageById(message.replyTo)
          .subscribe((reply) => {
            message.replyTo = reply; // Replace ID with the full message object
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
          this.refreshChats(); // Refresh chats after reacting
        },
        error: (err) => {
          console.error('Error reacting to message:', err);
        },
      });
    }
  }

  // Function to refresh the chat messages
refreshChats(): void {
  this.chatService.fetchChats().subscribe({
    next: (chats) => {
      this.chats = chats; // Update the chat list
      this.cdr.detectChanges(); // Detect changes if needed
    },
    error: (err) => {
      console.error('Error refreshing chats:', err);
    },
  });
}
}
