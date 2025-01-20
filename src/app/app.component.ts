import { Component,OnInit } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent,FooterComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showLayout = true; // Controls visibility of navbar and footer

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen for route changes
    this.router.events.subscribe(() => {
      // Hide navbar and footer on '/chat' route
      this.showLayout = !this.router.url.startsWith('/chat');
    });
  }
}
