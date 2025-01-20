import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-message-input',
  imports: [FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css'
})
export class MessageInputComponent {
  @Input() selectedContact: any; // Receives the selected contact
  @Output() messageSent = new EventEmitter<string>(); // Emits the sent message
  messageText: string = ''; // Two-way bound to the input field

  sendMessage(): void {
    if (this.messageText.trim()) {
      this.messageSent.emit(this.messageText.trim());
      this.messageText = ''; // Clear the input field
    }
  }
}
