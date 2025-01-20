import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() contacts: any[] = [];
  @Output() contactSelected = new EventEmitter<any>();

  searchTerm: string = '';
  filteredContacts: any[] = [];

  ngOnInit(): void {
    this.filteredContacts = [...this.contacts];
  }

  filterContacts(): void {
    this.filteredContacts = this.contacts.filter((contact) =>
      contact.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectContact(contact: any): void {
    this.contactSelected.emit(contact);
  }
}
