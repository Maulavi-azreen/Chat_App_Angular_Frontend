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

    if (!chatId || !receiverId || !this.currentUser?._id) {
      this.messageError.emit('Unable to find chat. Please select a contact or group.');
      return;
    }

    // ✅ Now passing separate arguments instead of an object
    this.socketService.sendMessage(
      this.currentUser._id,  // Sender ID
      receiverId,            // Receiver ID
      this.messageText,       // Message
      chatId                 // Chat ID
    );

    // Emit message event for UI update
    this.messageSent.emit(this.messageText);
    this.messageText = ''; 
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
