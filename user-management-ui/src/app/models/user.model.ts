export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  profileImagePath?: string | null;
  profileImageUrl?: string | null;
  profileImageType?: string | null;
}

export interface ProfileImageUploadResponse {
  profileImagePath: string;
  profileImageUrl: string;
  profileImageType: string;
}
