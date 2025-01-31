import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../service/message/message.service';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../service/socket/socket.service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule,CommonModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css',
})
export class MessageInputComponent {
  @Input() currentUser: any; 
  @Input() selectedContact: any;
  @Input() selectedGroup: any;
  @Input() editedMessage: any;  // Receive message to edit
  @Input() repliedMessage: any;  // Receive message to reply
  @Output() messageSent = new EventEmitter<string>();
  @Output() messageError = new EventEmitter<string>();

  messageText: string = '';

  constructor(private messageService: MessageService, private socketService:SocketService) {}

  //triggered when send button is clicked
  sendMessage(): void {
    if (!this.messageText.trim()) {
      this.messageError.emit('Message cannot be empty.');
      return;
    }

    const chatId = this.selectedContact?.chatId || this.selectedGroup?._id;
    const receiverId = this.selectedContact?._id || this.selectedGroup?._id;

    if (!chatId || !receiverId) {
      this.messageError.emit('Unable to find chat. Please select a contact or group.');
      return;
    }

    if (this.editedMessage) {
      // Update existing message
      this.messageService.editMessage(this.editedMessage._id, this.messageText).subscribe({
        next: (updatedMessage) => {
          this.messageSent.emit(updatedMessage);
          this.editedMessage = null;
          this.messageText = '';
        },
        error: () => {
          this.messageError.emit('Failed to update the message.');
        },
      });
    } else if (this.repliedMessage) {
      this.messageService.replyToMessage(this.repliedMessage._id, this.messageText, chatId).subscribe({
        next: (reply) => {
          this.messageSent.emit(reply);
          this.repliedMessage = null;
          this.messageText = '';
        },
        error: () => {
          this.messageError.emit('Failed to reply to the message.');
        },
      });
    } else {
      // Create a new message object
      const messageData = {
        chatId: chatId,
        senderId: this.currentUser._id,
        receiverId: receiverId,
        content: this.messageText,
        createdAt: new Date(),
        repliedTo: this.repliedMessage
          ? {
              _id: this.repliedMessage._id,
              content: this.repliedMessage.content,
            }
          : null,
      };

      // Send the message via WebSocket (real-time)
      this.socketService.sendMessage(
        messageData.senderId,
        messageData.receiverId,
        messageData.content,
        messageData.chatId
      );

      // Emit the message locally to update UI
      this.messageSent.emit(messageData);
      this.messageText = ''; // Clear input field
    }
  }

  

  // In MessageInputComponent
 cancelEdit(): void {
  this.messageText = this.editedMessage?.content || '';  // Reset text to original content
  this.editedMessage = null;  // Clear edit state
}

cancelReply(): void {
  this.messageText = '';
  this.repliedMessage = null;
}

}
