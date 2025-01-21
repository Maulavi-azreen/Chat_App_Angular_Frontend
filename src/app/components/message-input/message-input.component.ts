import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../service/message/message.service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css'
})
export class MessageInputComponent {
  @Input() selectedContact: any;
  @Output() messageSent = new EventEmitter<string>();
  messageText: string = '';

  constructor(private messageService: MessageService) {}

  sendMessage(): void {
    if (this.messageText.trim() && this.selectedContact?.chatId) {
      const chatId = this.selectedContact.chatId;
  
      this.messageService.sendMessage(this.messageText.trim(), chatId).subscribe({
        next: (message) => {
          this.messageSent.emit(message); // Emit the sent message to parent
          this.messageText = ''; // Clear the input field
          console.log('Message sent successfully:', message);
        },
        error: (err) => {
          console.error('Error sending message:', err);
        },
      });
    } else {
      console.error('Invalid input: Message text or chatId is missing.');
    }
  }
  
  
  
}
