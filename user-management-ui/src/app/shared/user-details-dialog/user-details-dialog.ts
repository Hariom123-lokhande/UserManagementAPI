import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { applyProfileImageResponse } from '../../utils/profile-image.util';
import { ProfileAvatar } from '../profile-avatar/profile-avatar';

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ProfileAvatar
  ],
  templateUrl: './user-details-dialog.html',
  styleUrl: './user-details-dialog.css'
})
export class UserDetailsDialog {
  readonly dialogRef = inject(MatDialogRef<UserDetailsDialog>);
  readonly data = inject(MAT_DIALOG_DATA);
  private userService = inject(UserService);

  isEditMode = signal(false);
  editData = { ...this.data };
  nameError = signal('');
  emailError = signal('');
  ageError = signal('');
  imageError = signal('');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploading = signal(false);

  profileImagePath = signal<string | null>(this.data.profileImagePath ?? this.data.ProfileImagePath ?? null);
  profileImageUrl = signal<string | null>(this.data.profileImageUrl ?? this.data.ProfileImageUrl ?? null);
  profileImageType = signal<string | null>(this.data.profileImageType ?? this.data.ProfileImageType ?? null);

  hasProfileImage = computed(() => Boolean(this.profileImagePath() || this.profileImageUrl()));

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

  close(refresh: boolean = false): void {
    this.dialogRef.close({ refresh });
  }

  toggleEdit() {
    this.isEditMode.set(!this.isEditMode());
    if (!this.isEditMode()) {
      this.editData = { ...this.data };
      this.clearErrors();
      this.resetImageSelection();
    }
  }

  clearErrors() {
    this.nameError.set('');
    this.emailError.set('');
    this.ageError.set('');
    this.imageError.set('');
  }

  resetImageSelection() {
    this.selectedFile.set(null);
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }
    this.previewUrl.set(null);
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
    this.clearErrors();

    let isValid = true;

    if (!this.editData.name?.trim()) {
      this.nameError.set('Name is required');
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.editData.email ?? '')) {
      this.emailError.set('Invalid email format');
      isValid = false;
    }

    if (Number(this.editData.age) <= 5) {
      this.ageError.set('Age must be greater than 5');
      isValid = false;
    }

    return isValid;
  }

  private uploadSelectedImage(onComplete: () => void) {
    const file = this.selectedFile();
    if (!file) {
      onComplete();
      return;
    }

    this.isUploading.set(true);
    this.userService.uploadProfileImage(this.data.id, file).subscribe({
      next: (response) => {
        applyProfileImageResponse(this.data, response);
        applyProfileImageResponse(this.editData, response);
        this.profileImagePath.set(response.profileImagePath);
        this.profileImageUrl.set(response.profileImageUrl);
        this.profileImageType.set(response.profileImageType);
        this.resetImageSelection();
        this.isUploading.set(false);
        onComplete();
      },
      error: (err) => {
        this.imageError.set(err.error?.message ?? 'Failed to upload profile image.');
        this.isUploading.set(false);
      }
    });
  }

  removeProfileImage() {
    if (!this.hasProfileImage()) {
      return;
    }

    this.isUploading.set(true);
    this.userService.deleteProfileImage(this.data.id).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.imageError.set('');
        this.resetImageSelection();

        this.profileImagePath.set(null);
        this.profileImageUrl.set(null);
        this.profileImageType.set(null);

        this.data.profileImagePath = null;
        this.data.profileImageUrl = null;
        this.data.profileImageType = null;

        this.editData.profileImagePath = null;
        this.editData.profileImageUrl = null;
        this.editData.profileImageType = null;
      },
      error: (err) => {
        this.imageError.set(err.error?.message ?? 'Failed to remove profile photo.');
        this.isUploading.set(false);
      }
    });
  }

  updateUser() {
    if (!this.validateForm()) {
      return;
    }

    const payload = {
      id: this.data.id,
      name: this.editData.name,
      email: this.editData.email,
      age: this.editData.age
    };

    this.userService.updateUser(this.data.id, payload).subscribe({
      next: () => {
        Object.assign(this.data, this.editData);
        this.uploadSelectedImage(() => {
          this.isEditMode.set(false);
          this.dialogRef.close({ refresh: true });
        });
      },
      error: (err) => console.error('Error updating user:', err)
    });
  }
}
