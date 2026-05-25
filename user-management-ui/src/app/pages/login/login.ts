import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],

  templateUrl: './login.html',

  styleUrl: './login.css'
})
export class Login {

  private authService = inject(AuthService);

  private router = inject(Router);

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  email = signal('');

  password = signal('');

  isLoading = signal(false);

  login(form: NgForm) {

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const body = {
      email: this.email(),
      password: this.password()
    };

    this.authService.login(body)
      .subscribe({

        next: (response) => {

          localStorage.setItem(
            'token',
            response.token
          );

          this.authService.isLoggedIn.set(true);

          this.isLoading.set(false);

          this.router.navigate(['/home']);
        },

        error: () => {

          this.isLoading.set(false);

          alert('Invalid Email Or Password');
        }
      });
  }
}
