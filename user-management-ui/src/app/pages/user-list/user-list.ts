import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { UserDetailsDialog } from '../../shared/user-details-dialog/user-details-dialog';
import { AppPagination } from '../../shared/pagination/pagination';
import { ProfileAvatar } from '../../shared/profile-avatar/profile-avatar';

@Component({
  selector: 'app-user-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    AppPagination,
    ProfileAvatar
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList implements OnInit {

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  users = signal<any[]>([]);
  selectedUserIds = signal<number[]>([]);
  currentUserEmail = signal(this.authService.getCurrentUserEmail()?.toLowerCase() ?? '');
  searchTerm = signal('');
  page = signal(1);
  totalCount = signal(0);
  readonly pageSize = 7;

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));
  // Select-all should only apply to users other than the logged-in account.
  allSelected = computed(() =>
    this.selectableUsers().length > 0 &&
    this.selectableUsers().every(user => this.selectedUserIds().includes(user.id))
  );
  hasSelectedUsers = computed(() => this.selectedUserIds().length > 0);
  selectedCount = computed(() => this.selectedUserIds().length);
  // Self rows stay out of bulk actions so a user can never remove their own account.
  selectableUsers = computed(() =>
    this.users().filter(user => !this.isCurrentUser(user.email))
  );

  displayedColumns: string[] = ['select', 'id', 'name', 'email', 'age', 'actions'];

  constructor() {
    // Auto-reload data when search or page changes
    effect(() => {
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    // Initial data load is handled by the effect in constructor
  }

  loadUsers() {
    this.userService.getUsers(this.page(), this.pageSize, this.searchTerm()).subscribe({
      next: (response: any) => {
        // Handling both camelCase and PascalCase from API
        const users = response.users || response.Users || [];
        const totalCount = response.totalCount ?? response.TotalCount ?? 0;
        
        this.users.set(users);
        this.totalCount.set(totalCount);
        this.selectedUserIds.set([]);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  toggleSelectAll(checked: boolean) {
    this.selectedUserIds.set(checked ? this.selectableUsers().map(user => user.id) : []);
  }

  toggleUserSelection(userId: number, checked: boolean) {
    this.selectedUserIds.update(selectedIds =>
      checked
        ? (selectedIds.includes(userId) ? selectedIds : [...selectedIds, userId])
        : selectedIds.filter(id => id !== userId)
    );
  }

  isUserSelected(userId: number) {
    return this.selectedUserIds().includes(userId);
  }

  isCurrentUser(userEmail: string | null | undefined) {
    // Compare each row against the logged-in user's email to drive the UI state.
    return !!userEmail && userEmail.toLowerCase() === this.currentUserEmail();
  }

  deleteUser(id: number, userEmail?: string) {
    // Guard against direct self-delete calls even if the UI is bypassed.
    if (this.isCurrentUser(userEmail)) {
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.log(error)
      });
    }
  }

  deleteSelectedUsers() {
    // Bulk delete only keeps rows that do not belong to the current user.
    const selectedIds = this.selectedUserIds().filter(id =>
      this.users().some(user => user.id === id && !this.isCurrentUser(user.email))
    );

    if (!selectedIds.length) {
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected users?`)) {
      forkJoin(selectedIds.map(id => this.userService.deleteUser(id))).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.log(error)
      });
    }
  }

  viewUserDetails(user: any) {
    const dialogRef = this.dialog.open(UserDetailsDialog, {
      width: '750px',
      maxWidth: '95vw',
      data: user,
      panelClass: 'custom-dialog-container'
    });

    // Refresh list if user was deleted or edited inside the dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result?.refresh) {
        this.loadUsers();
      }
    });
  }

}
