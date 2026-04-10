import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`;
  private userUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  createGroup(data: { name: string }): Observable<{ message: string; group: Group }> {
    return this.http.post<{ message: string; group: Group }>(this.apiUrl, data);
  }

  addMember(groupId: string, email: string): Observable<{ message: string; group: Group }> {
    return this.http.post<{ message: string; group: Group }>(`${this.apiUrl}/${groupId}/members`, { email });
  }

  removeMember(groupId: string, userId: string): Observable<{ message: string; group: Group }> {
    return this.http.delete<{ message: string; group: Group }>(`${this.apiUrl}/${groupId}/members/${userId}`);
  }

  deleteGroup(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  searchUsers(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.userUrl}/search`, { params: { email } });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.userUrl}/me`);
  }

  updateProfile(data: { name?: string; email?: string }): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.userUrl}/me`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.userUrl}/me/password`, data);
  }
}