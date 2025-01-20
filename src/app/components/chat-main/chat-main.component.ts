import { Component, OnInit  } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-main',
  imports: [SidebarComponent,ChatWindowComponent,MessageInputComponent,CommonModule],
  templateUrl: './chat-main.component.html',
  styleUrl: './chat-main.component.css'
})
export class ChatMainComponent implements OnInit {
  contacts = [
    { id: 1, name: 'Alice', profilePicture: 'assets/img/alice.jpg' },
    { id: 2, name: 'Bob', profilePicture: 'assets/img/bob.jpg' },
    { id: 3, name: 'Charlie', profilePicture: 'assets/img/charlie.jpg' },
    { id: 4, name: 'Alice', profilePicture: 'assets/img/alice.jpg' },
    { id: 5, name: 'Bob', profilePicture: 'assets/img/bob.jpg' },
    { id: 6, name: 'Charlie', profilePicture: 'assets/img/charlie.jpg' },
  ];

  messages = [
    { sender: 'me', text: 'Hello!' },
    { sender: 'Alice', text: 'Hi, how are you?' },
    { sender: 'me', text: 'I am good, thanks!' },
  ];

  selectedContact: any = null;

  ngOnInit(): void {}

  onContactSelected(contact: any): void {
    this.selectedContact = contact;
    console.log('Selected contact:', contact);
  }

  onMessageSent(newMessage: string): void {
    // Add the new message to the chat
    this.messages.push({ sender: 'me', text: newMessage });
    console.log('Message sent:', newMessage);
  }
}

