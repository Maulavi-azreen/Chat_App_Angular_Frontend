import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../service/message/message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule,CommonModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css',
})
export class MessageInputComponent {
  @Input() selectedContact: any;
  @Input() editedMessage: any;  // Receive message to edit
  @Input() repliedMessage: any;  // Receive message to reply
  @Output() messageSent = new EventEmitter<string>();
  @Output() messageError = new EventEmitter<string>();

  messageText: string = '';

  constructor(private messageService: MessageService) {}

  sendMessage(): void {
    if (!this.messageText.trim()) {
      this.messageError.emit('Message cannot be empty.');
      return;
    }

    if (!this.selectedContact?.chatId) {
      this.messageError.emit('Unable to find chat. Please select a contact.');
      return;
    }

    if (this.editedMessage) {
      // Update existing message
      this.messageService.editMessage(this.editedMessage._id, this.messageText).subscribe({
        next: (updatedMessage) => {
          this.messageSent.emit(updatedMessage);
          this.editedMessage = null;  // Clear edit mode
          this.messageText = '';  // Clear input
        },
        error: (err) => {
          this.messageError.emit('Failed to update the message.');
        },
      });
    } 
    else if (this.repliedMessage) {
      this.messageService.replyToMessage(this.repliedMessage._id, this.messageText, this.selectedContact.chatId)
      .subscribe({
        next: (reply) => {
          this.messageSent.emit(reply);
          this.repliedMessage = null;
          this.messageText = '';
        },
        error: (err) => {
          console.error('Reply message failed:', err);
          this.messageError.emit('Failed to reply to the message.');
        },
      });
    
    }
    else {
      // Send a new message
      this.messageService.sendMessage(this.messageText, this.selectedContact.chatId).subscribe({
        next: (newMessage) => {
          this.messageSent.emit(newMessage);
          this.messageText = '';  // Clear input field
        },
        error: (err) => {
          this.messageError.emit('Failed to send the message.');
        },
      });
    }
  }

  // In MessageInputComponent
  cancelEdit(): void {
  // Reset the messageText to the original message content (without "Edited")
 
    this.messageText = this.editedMessage.content;  // Revert to the original message content
  
  // Reset the edit state
  this.editedMessage = null;  // Clear the edited message state
}

cancelReply(): void {
  this.messageText = '';
  this.repliedMessage = null;
}
}
