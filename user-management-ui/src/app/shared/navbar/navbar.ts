import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,MatToolbarModule,MatButtonModule,MatMenuModule,
    MatIconModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private authService = inject(AuthService);

  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
