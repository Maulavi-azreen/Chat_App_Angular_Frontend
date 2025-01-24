// reset-password.component.ts
import { Component } from '@angular/core';
import { UserService } from '../service/user/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
FormsModule

@Component({
  imports:[FormsModule,CommonModule],
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  currentStep: number = 1; // Start with Step 1: Email

  constructor(private resetPasswordService: UserService, private router: Router) {}

  //For Steps tracking for tab pills transitions
  setStep(step: number): void {
    this.currentStep = step;
  }

  sendOtp() {
    this.resetPasswordService.sendOtp(this.email).subscribe(
      (response) => {
        console.log('OTP sent successfully');
        alert('OTP sent successfully');
         // Move to OTP verification tab after OTP is sent
         this.setStep(2);
         console.log("Current Step",this.currentStep);
      },
      (error) => {
        console.error('Error sending OTP:', error);
      }
    );
  }

  verifyOtp() {
    this.resetPasswordService.verifyOtp(this.email, this.otp).subscribe(
      (response) => {
        console.log('OTP verified successfully');
        alert('OTP verified successfully');
       // Move to OTP verification tab after OTP is sent
       this.setStep(3);
       console.log("Current Step",this.currentStep);
      },
      (error) => {
        console.error('Error verifying OTP:', error);
      }
    );
  }

  resetPassword() {
    this.resetPasswordService.resetPassword(this.email, this.newPassword).subscribe(
      (response) => {
        console.log('Password reset successfully');
        alert('Password reset successfully');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error resetting password:', error);
      }
    );
  }
}
