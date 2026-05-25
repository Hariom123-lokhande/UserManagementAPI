import { Component, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DEFAULT_AVATAR, getProfileImageUrl } from '../../utils/profile-image.util';

@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-avatar.html',
  styleUrl: './profile-avatar.css'
})
export class ProfileAvatar {
  user = input.required<{
    profileImagePath?: string | null;
    ProfileImagePath?: string | null;
    profileImageUrl?: string | null;
    ProfileImageUrl?: string | null;
    profileImageType?: string | null;
    ProfileImageType?: string | null;
  }>();
  size = input<'small' | 'large'>('small');

  displayUrl = signal(DEFAULT_AVATAR);
  private failedUrl: string | null = null;

  constructor() {
    effect(() => {
      const url = getProfileImageUrl(this.user());

      if (this.failedUrl === url || this.displayUrl() === url) {
        return;
      }
      this.failedUrl = null;
      this.displayUrl.set(url);
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (this.displayUrl() === DEFAULT_AVATAR) {
      img.onerror = null;
      return;
    }

    this.failedUrl = this.displayUrl();
    this.displayUrl.set(DEFAULT_AVATAR);
    img.onerror = null;
  }
}
