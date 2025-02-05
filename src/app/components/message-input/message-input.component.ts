import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../service/message/message.service';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../service/socket/socket.service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, CommonModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css',
})
export class MessageInputComponent {
  @Input() currentUser: any;
  @Input() selectedContact: any;
  @Input() selectedGroup: any;
  @Input() editedMessage: any; // Receive message to edit
  @Input() repliedMessage: any; // Receive message to reply
  @Output() messageSent = new EventEmitter<string>();
  @Output() messageError = new EventEmitter<string>();
  @Output() typingIndicator = new EventEmitter<boolean>(); // To show/hide typing indicator

  messageText: string = '';
  typingTimeout: any;
  typing: boolean = false; // Prevent duplicate typing events

  constructor(
    private messageService: MessageService,
    private socketService: SocketService
  ) {}

   // Triggered when the user types in the message input field
   onInputChange(): void {
    console.log("⌨️ onInputChange triggered!");

    const senderId = this.currentUser?._id;
    const chatId = this.selectedContact?.chatId || this.selectedGroup?._id;
    const senderName = this.currentUser?.name;

    if (!senderId || !chatId || !senderName) return;

    // Emit "typing" event only if not already typing
    if (!this.typing) {
      this.typing = true;
      console.log(`📤 Emitting typing event → Chat: ${chatId}, User: ${senderName}`);
      this.socketService.emitTyping(senderId, chatId, senderName);
      this.typingIndicator.emit(true);
    }

    // Reset typing state after 3 seconds
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.typing = false;
      console.log(`🛑 Emitting stopTyping event → Chat: ${chatId}, User: ${senderName}`);
      this.socketService.emitStopTyping(senderId, chatId);
      this.typingIndicator.emit(false);
    }, 5000);
  }

  
  
  //triggered when send button is clicked
  sendMessage(): void {
    if (!this.messageText.trim()) {
      this.messageError.emit('Message cannot be empty.');
      return;
    }

    const chatId = this.selectedContact?.chatId || this.selectedGroup?._id;
    const receiverId = this.selectedContact?._id || this.selectedGroup?._id;
    const senderId = this.currentUser?._id;

    console.log('Attempting to send message:');
    console.log('Sender:', senderId);
    console.log('Receiver:', receiverId);
    console.log('Chat ID:', chatId);
    console.log('Message Text:', this.messageText);

    if (!chatId || !receiverId || !senderId) {
      this.messageError.emit(
        'Invalid chat. Please select a contact or group.'
      );
      return;
    }

    // **Store the message content before clearing input**
    const messageContent = this.messageText;
    this.messageText = ''; // Clear input field AFTER storing the message

    // **Create a new message object to update UI instantly**
    const newMessage: any = {
      _id: Math.random().toString(36).substring(7), // Temporary unique ID
      sender: { _id: senderId, name: this.currentUser.name },
      receiver: { _id: receiverId },
      content: messageContent, // Use stored message
      chat: chatId,
      replyTo: this.repliedMessage ? this.repliedMessage._id : null,
      createdAt: new Date(),
    };

    // **Emit message to update UI immediately**
    this.messageSent.emit(newMessage);

    // **Send message via API**
    this.messageService
      .sendMessage(
        messageContent, // Use stored message
        chatId,
        senderId,
        receiverId,
        
      )
      .subscribe({
        next: (response) => {
          console.log(
            'Message successfully sent to API and saved in db',
            response
          );
          // Optionally update UI with the confirmed message ID from DB
          newMessage._id = response._id;
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.messageError.emit(
            `Error sending message: ${error?.message || 'Please try again.'}`
          );
        },
      });
  }

  // In MessageInputComponent
  cancelEdit(): void {
    this.messageText = this.editedMessage?.content || ''; // Reset text to original content
    this.editedMessage = null; // Clear edit state
  }

  cancelReply(): void {
    this.messageText = '';
    this.repliedMessage = null;
  }
}
