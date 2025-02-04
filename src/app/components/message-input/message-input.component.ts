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
  // sendMessage(): void {
  //   if (!this.messageText.trim()) {
  //     this.messageError.emit('Message cannot be empty.');
  //     return;
  //   }

  //   const chatId = this.selectedContact?.chatId || this.selectedGroup?._id;
  //   const receiverId = this.selectedContact?._id || this.selectedGroup?._id;

  //   if (!chatId || !receiverId || !this.currentUser?._id) {
  //     this.messageError.emit('Unable to find chat. Please select a contact or group.');
  //     return;
  //   }

  //   // ✅ Now passing separate arguments instead of an object
  //   this.messageService.sendMessage(
  //     this.currentUser._id,  // Sender ID
  //     receiverId,            // Receiver ID
  //     this.messageText,       // Message
  //     chatId                 // Chat ID
  //   );

  //   // Emit message event for UI update
  //   this.messageSent.emit(this.messageText);
  //   this.messageText = ''; 
  // }
//   sendMessage(): void {
//     if (!this.messageText.trim()) {
//       this.messageError.emit('Message cannot be empty.');
//       return;
//     }

//     const chatId = this.selectedContact?.chatId || this.selectedGroup?._id;
//     const receiverId = this.selectedContact?._id || this.selectedGroup?._id;
//     console.log("Sender and Receiver Id",this.currentUser._id,receiverId);
//     console.log("Chat ID:", chatId);

//     // Check if chatId and receiverId are valid
//   if (!chatId || !receiverId || !this.currentUser?._id) {
//     this.messageError.emit('Unable to find chat. Please select a contact or group.');
//     return;
//   }

//   // **Send message via API**
//   this.messageService.sendMessage(
//     this.messageText,   // Message content
//     chatId,             // Chat ID
//     this.currentUser._id, // Sender ID
//     receiverId          // Receiver ID
//   ).subscribe({
//     next: (response) => {
//       // Emit message event for UI update after successful message send
//       this.messageSent.emit(this.messageText);
//       this.messageText = '';  // Clear input field after sending
//     },
//     error: (error) => {
//       console.error('Error sending message:', error);
//       this.messageError.emit(`Error sending message: ${error?.message || 'Please try again.'}`);
//     },
//   });
// }
sendMessage(): void {
  if (!this.messageText.trim()) {
    this.messageError.emit('Message cannot be empty.');
    return;
  }

  const chatId = this.selectedContact?.chatId || this.selectedGroup?._id;
  const receiverId = this.selectedContact?._id || this.selectedGroup?._id;
  const senderId = this.currentUser?._id;

  console.log("📤 Attempting to send message:");
  console.log("💡 Sender:", senderId);
  console.log("💡 Receiver:", receiverId);
  console.log("💡 Chat ID:", chatId);
  console.log("💡 Message Text:", this.messageText);

  if (!chatId || !receiverId || !senderId) {
    this.messageError.emit('❌ Invalid chat. Please select a contact or group.');
    return;
  }

  // **Store the message content before clearing input**
  const messageContent = this.messageText; 
  this.messageText = '';  // Clear input field AFTER storing the message

  // **Create a new message object to update UI instantly**
  const newMessage: any = {
    _id: Math.random().toString(36).substring(7), // Temporary unique ID
    sender: { _id: senderId, name: this.currentUser.name },
    receiver: { _id: receiverId },
    content: messageContent,  // Use stored message
    chat: chatId,
    createdAt: new Date(),
  };

  // **Emit message to update UI immediately**
  this.messageSent.emit(newMessage);

  // **Send message via API**
  this.messageService.sendMessage(
    messageContent,   // Use stored message
    chatId,           
    senderId,         
    receiverId        
  ).subscribe({
    next: (response) => {
      console.log('✅ Message successfully sent to API and saved in db', response);
      // Optionally update UI with the confirmed message ID from DB
      newMessage._id = response._id;
    },
    error: (error) => {
      console.error('❌ Error sending message:', error);
      this.messageError.emit(`❌ Error sending message: ${error?.message || 'Please try again.'}`);
    },
  });
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
