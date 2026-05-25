import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../services/user';
import { ProfileAvatar } from '../../shared/profile-avatar/profile-avatar';

@Component({
  selector: 'app-user-form',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    ProfileAvatar
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  userId = 0;
  isEditMode = signal(false);
  name = signal('');
  email = signal('');
  age = signal(0);
  profileImagePath = signal<string | null>(null);
  profileImageUrl = signal<string | null>(null);
  profileImageType = signal<string | null>(null);
  nameError = signal('');
  emailError = signal('');
  ageError = signal('');
  imageError = signal('');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isSaving = signal(false);

  avatarUser = computed(() => {
    if (this.previewUrl()) {
      return { profileImagePath: this.previewUrl() };
    }

    return {
      profileImagePath: this.profileImagePath(),
      profileImageUrl: this.profileImageUrl(),
      profileImageType: this.profileImageType()
    };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.userId = +id;
      this.isEditMode.set(true);
      this.loadUser(this.userId);
    }
  }

  loadUser(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (response) => {
        this.name.set(response.name);
        this.email.set(response.email);
        this.age.set(response.age);
        this.profileImagePath.set(response.profileImagePath ?? null);
        this.profileImageUrl.set(response.profileImageUrl ?? null);
        this.profileImageType.set(response.profileImageType ?? null);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.imageError.set('Only JPG, PNG, GIF, and WEBP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.imageError.set('Image must be 5 MB or smaller.');
      return;
    }

    this.imageError.set('');
    this.selectedFile.set(file);

    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }
    this.previewUrl.set(URL.createObjectURL(file));
    input.value = '';
  }

  validateForm(): boolean {
    this.nameError.set('');
    this.emailError.set('');
    this.ageError.set('');

    let isValid = true;

    if (!this.name().trim()) {
      this.nameError.set('Name is required');
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email())) {
      this.emailError.set('Invalid email format');
      isValid = false;
    }

    if (this.age() <= 5) {
      this.ageError.set('Age must be greater than 5');
      isValid = false;
    }

    return isValid;
  }

  private uploadImageIfNeeded(userId: number, onComplete: () => void) {
    const file = this.selectedFile();
    if (!file) {
      onComplete();
      return;
    }

    this.userService.uploadProfileImage(userId, file).subscribe({
      next: (response) => {
        this.profileImagePath.set(response.profileImagePath);
        this.profileImageUrl.set(response.profileImageUrl);
        this.profileImageType.set(response.profileImageType);
        onComplete();
      },
      error: (err) => {
        this.imageError.set(err.error?.message ?? 'Failed to upload profile image.');
        this.isSaving.set(false);
      }
    });
  }

  saveUser() {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving.set(true);

    const userData = {
      id: this.userId,
      name: this.name(),
      email: this.email(),
      age: this.age()
    };

    if (this.isEditMode()) {
      this.userService.updateUser(this.userId, userData).subscribe({
        next: () => {
          this.uploadImageIfNeeded(this.userId, () => {
            this.snackBar.open('User Updated Successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/users']);
          });
        },
        error: () => this.isSaving.set(false)
      });
      return;
    }

    this.userService.addUser(userData).subscribe({
      next: (createdUser) => {
        const newUserId = createdUser.id;
        this.uploadImageIfNeeded(newUserId, () => {
          this.snackBar.open('User Added Successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/users']);
        });
      },
      error: () => this.isSaving.set(false)
    });
  }
}
