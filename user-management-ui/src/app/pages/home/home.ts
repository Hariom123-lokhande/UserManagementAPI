import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-home',
  imports: [RouterLink,MatButtonModule,MatCardModule,MatToolbarModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
}
