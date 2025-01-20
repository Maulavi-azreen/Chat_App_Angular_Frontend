import { CommonModule } from '@angular/common';
import { Component, Input, OnInit  } from '@angular/core';
import { ChatNavbarComponent } from "../chat-navbar/chat-navbar.component";

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, ChatNavbarComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent {
  @Input() messages: any[] = [];
  @Input() selectedContact: any;

}
