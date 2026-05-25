import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class AppPagination {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}
