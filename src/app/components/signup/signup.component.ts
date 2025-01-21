import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SignupService } from '../../service/signup/signup.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports:[FormsModule,CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private signupService: SignupService, private router: Router) {}

  // Handle form submission
  onSubmit() {
    // debugger;
    this.signupService.registerUser(this.name, this.email, this.password, this.confirmPassword).subscribe({
      next: (response) => {
        // debugger;
        console.log('User registered successfully:', response);
        this.router.navigate(['/login']); // Redirect to login page after successful signup
      },
      error: (err) => {
        console.error('Signup failed:', err);
        this.errorMessage = err.error.message || 'Server error';
      },
    });
  }
}
