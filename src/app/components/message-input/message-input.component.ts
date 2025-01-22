import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../service/message/message.service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css',
})
export class MessageInputComponent {
  @Input() selectedContact: any;
  @Output() messageSent = new EventEmitter<string>();
  @Output() messageError = new EventEmitter<string>();

  messageText: string = '';

  constructor(private messageService: MessageService) {}

  sendMessage(): void {
    if (!this.messageText.trim()) {
      console.error('Message text is empty.');
      this.messageError.emit('Message cannot be empty.');
      return;
    }

    if (!this.selectedContact?.chatId) {
      console.error('Chat ID is missing.');
      this.messageError.emit('Unable to find chat. Please select a contact.');
      return;
    }

    const chatId = this.selectedContact.chatId;

    this.messageService.sendMessage(this.messageText.trim(), chatId).subscribe({
      next: (message) => {
        this.messageSent.emit(message); // Emit the new message to parent
        this.messageText = ''; // Clear input field
        console.log('Message sent successfully:', message);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.messageError.emit('Failed to send the message.');
      },
    });
  }
}
