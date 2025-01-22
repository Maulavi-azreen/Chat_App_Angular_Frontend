import { Component } from '@angular/core';
import { RouterLink ,Router} from '@angular/router';
import { LoginService } from '../../service/login/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink,FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.loginService.login(this.email, this.password).subscribe(
      (response) => {
        // Store token in localStorage or session
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          _id: response._id,
          name: response.name,
          // email: response.email,
          // profilePic: response.profilePic,
        }));

        // Redirect to dashboard or another page
        this.router.navigate(['/chat']);
      },
      (error) => {
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
      }
    );
  }

}
