import { Component ,Input} from '@angular/core';

@Component({
  selector: 'app-chat-navbar',
  imports: [],
  templateUrl: './chat-navbar.component.html',
  styleUrl: './chat-navbar.component.css'
})
export class ChatNavbarComponent {
  @Input() selectedContact: any;
  @Input() selectedGroup : any;

}
