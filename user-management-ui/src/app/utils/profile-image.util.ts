import { environment } from '../../environments/environment';

export const DEFAULT_AVATAR = 'assets/images/default-avatar.svg';

export function getProfileImagePath(user: {
  profileImagePath?: string | null;
  ProfileImagePath?: string | null;
} | null | undefined): string | null {
  if (!user) {
    return null;
  }

  return user.profileImagePath ?? user.ProfileImagePath ?? null;
}

export function getProfileImageUrl(user: {
  profileImagePath?: string | null;
  ProfileImagePath?: string | null;
  profileImageUrl?: string | null;
  ProfileImageUrl?: string | null;
} | null | undefined): string {
  if (!user) {
    return DEFAULT_AVATAR;
  }

  const storedUrl = user.profileImageUrl ?? user.ProfileImageUrl;
  if (storedUrl) {
    return storedUrl;
  }

  const path = getProfileImagePath(user);

  if (!path) {
    return DEFAULT_AVATAR;
  }

  if (path.startsWith('blob:')) {
    return path;
  }

  const apiRoot = environment.apiBaseUrl.replace('/api', '');
  return `${apiRoot}/uploads/${path}`;
}

export function getProfileImageType(user: {
  profileImageType?: string | null;
  ProfileImageType?: string | null;
} | null | undefined): string | null {
  if (!user) {
    return null;
  }

  return user.profileImageType ?? user.ProfileImageType ?? null;
}

export function applyProfileImageResponse(
  target: {
    profileImagePath?: string | null;
    profileImageUrl?: string | null;
    profileImageType?: string | null;
  },
  response: {
    profileImagePath: string;
    profileImageUrl: string;
    profileImageType: string;
  }
): void {
  target.profileImagePath = response.profileImagePath;
  target.profileImageUrl = response.profileImageUrl;
  target.profileImageType = response.profileImageType;
}
