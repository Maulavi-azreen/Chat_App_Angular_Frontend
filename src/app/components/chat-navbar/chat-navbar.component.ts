import { CommonModule } from '@angular/common';
import { Component ,Input,Output,EventEmitter} from '@angular/core';
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

  @Output() chatDeleted = new EventEmitter<void>();


  chats : any[]=[]
  groups:any[]=[]


  constructor(private chatService: ChatService){}


   // Determine if it's a group chat or individual chat for rendering icons on navbar accordingly
   get isGroupChat(): boolean {
    return !!this.selectedGroup;
  }

  fetchChats(): void {
    this.chatService.fetchChats().subscribe({
      next: (chats) => {
        const userId = localStorage.getItem('userId'); // Get logged-in user's ID
        this.chats = chats.filter(chat => !chat.deletedForUsers.includes(userId)); // Hide deleted chats
  
        this.groups = this.chats.filter(chat => chat.isGroupChat);
      },
      error: (error) => console.error('Error fetching chats:', error),
    });
  }
  // Handle rename
  onRenameChat(): void {
    const newChatName = prompt('Enter new chat name:', this.isGroupChat ? this.selectedGroup?.chatName : this.selectedContact?.name);
  
    if (newChatName && newChatName.trim() !== '') {
      const chatId = this.isGroupChat ? this.selectedGroup?._id : this.selectedContact?.chatId; // Get the chat ID
      if (!chatId) {
        alert('Invalid chat selection.');
        return;
      }
  
      this.chatService.renameChat(chatId, newChatName.trim()).subscribe({
        next: (updatedChat) => {
          console.log('Chat renamed successfully:', updatedChat);
          if (this.isGroupChat) {
            this.selectedGroup.chatName = updatedChat.chatName;  // Update UI
          } else {
            this.selectedContact.name = updatedChat.chatName;  // Update UI
          }
        },
        error: (err) => {
          console.error('Error renaming chat:', err);
          alert('Failed to rename chat. Please try again.');
        },
      });
    }
  }
  
  // Handle delete
  onDeleteChat(): void {
    const chatId = this.isGroupChat
      ? this.selectedGroup?._id
      : this.selectedContact?.chatId;  // Ensure it's the chat ID, not user ID!
  
    if (chatId) {
      if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        this.chatService.deleteChatForUser(chatId).subscribe({
          next: (response) => {
            console.log('Chat deleted successfully:', response);
            alert('Chat deleted for you.');
            this.fetchChats();
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
