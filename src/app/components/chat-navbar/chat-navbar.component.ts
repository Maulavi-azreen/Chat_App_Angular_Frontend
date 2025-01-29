import { CommonModule } from '@angular/common';
import { Component ,Input} from '@angular/core';
import { ChatService } from '../../service/chat/chat.service';


@Component({
  selector: 'app-chat-navbar',
  imports: [CommonModule],
  templateUrl: './chat-navbar.component.html',
  styleUrl: './chat-navbar.component.css'
})
export class ChatNavbarComponent{
  @Input() selectedContact: any;
  @Input() selectedGroup : any;
  @Input() userStatus: string = 'offline';



  constructor(private chatService: ChatService){}


   // Determine if it's a group chat or individual chat for rendering icons on navbar accordingly
   get isGroupChat(): boolean {
    return !!this.selectedGroup;
  }


  // Handle rename
  onRenameChat(): void {
    if (this.isGroupChat && this.selectedGroup?._id) {
      const newChatName = prompt('Enter new group name:', this.selectedGroup.chatName);
      
      if (newChatName && newChatName.trim() !== '') {
        this.chatService.renameGroupChat(this.selectedGroup._id, newChatName.trim()).subscribe({
          next: (updatedGroup) => {
            console.log('Group renamed successfully:', updatedGroup);
            this.selectedGroup.chatName = updatedGroup.chatName;  // Update UI with new name
          },
          error: (err) => {
            console.error('Error renaming group:', err);
            alert('Failed to rename group. Please try again.');
          },
        });
      }
    } else {
      alert('Group chat not selected or invalid group ID.');
    }
  }
  // Handle delete
  onDeleteChat(): void {
    const chatId = this.isGroupChat
    ? this.selectedGroup?._id
    : this.selectedContact?._id;

  if (chatId) {
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      this.chatService.deleteChatForUser(chatId).subscribe({
        next: (response) => {
          console.log('Chat deleted successfully:', response);
          alert('Chat deleted for you.');
          // Optionally clear the selected chat from the UI
          if (this.isGroupChat) {
            this.selectedGroup = null;
          } else {
            this.selectedContact = null;
          }
        },
        error: (err) => {
          console.error('Error deleting chat:', err);
          alert('Failed to delete chat. Please try again.');
        },
      });
    }
  } else {
    alert('No chat selected to delete.');
  }
}


  // Handle exit group (only applicable for group chats)
  onExitGroup(): void {
    if (this.isGroupChat) {
      console.log('Exiting group:', this.selectedGroup.name);
      // Implement exit group logic
    }
  }
}
