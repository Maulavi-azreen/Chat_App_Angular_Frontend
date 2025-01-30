import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SignupService } from '../../service/signup/signup.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports:[FormsModule,CommonModule,RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(private signupService: SignupService, private router: Router) {}

  // Handle form submission
  onSubmit() {
    this.successMessage = '';
    // debugger;
    this.signupService.registerUser(this.name, this.email, this.password, this.confirmPassword).subscribe({
      next: (response) => {
        // debugger;
        console.log('User registered successfully:', response);
        this.successMessage = 'Signup successful! and a welcome email has been sent to you. Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Signup failed:', err);
        this.errorMessage = err.error.message || 'Server error';
      },
    });
  }
}
