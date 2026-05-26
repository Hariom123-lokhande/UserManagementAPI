import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProfileImageUploadResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Users`;

  getUsers(page: number = 1, pageSize: number = 7, searchTerm: string = '') {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      searchTerm: searchTerm
    };
    return this.http.get<{ users: User[]; totalCount: number }>(this.apiUrl, { params });
  }

  getUserById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  addUser(userData: Partial<User>) {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: number, userData: Partial<User>) {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteProfileImage(userId: number) {
    return this.http.delete(`${this.apiUrl}/${userId}/profile-image`);
  }

  uploadProfileImage(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ProfileImageUploadResponse>(
      `${this.apiUrl}/${userId}/profile-image`,
      formData
    );
  }
}
