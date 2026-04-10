import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { GroupService } from '../../services/group';
import { User } from '../../models/user.model';
import { Group } from '../../models/group.model';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  groups: Group[] = [];

  profileName = '';
  profileEmail = '';
  profileSuccess = '';
  profileError = '';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordSuccess = '';
  passwordError = '';

  newGroupName = '';
  addMemberEmail = '';
  selectedGroupId = '';
  groupSuccess = '';
  groupError = '';

  activeTab = 'profile';

  constructor(
    private authService: AuthService,
    private groupService: GroupService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileName = this.user.name;
      this.profileEmail = this.user.email;
    }
    this.loadGroups();
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => { this.groups = groups; },
      error: () => {}
    });
  }

  updateProfile(): void {
    this.profileSuccess = '';
    this.profileError = '';

    this.groupService.updateProfile({
      name: this.profileName,
      email: this.profileEmail
    }).subscribe({
      next: (res) => {
        this.profileSuccess = res.message;
        this.authService.updateLocalUser(res.user);
        this.user = res.user;
      },
      error: (err) => {
        this.profileError = err.error?.message || 'Failed to update profile';
      }
    });
  }

  changePassword(): void {
    this.passwordSuccess = '';
    this.passwordError = '';

    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }

    this.groupService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.passwordSuccess = res.message;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      },
      error: (err) => {
        this.passwordError = err.error?.message || 'Failed to change password';
      }
    });
  }

  createGroup(): void {
    this.groupSuccess = '';
    this.groupError = '';

    if (!this.newGroupName.trim()) {
      this.groupError = 'Group name is required';
      return;
    }

    this.groupService.createGroup({ name: this.newGroupName }).subscribe({
      next: (res) => {
        this.groupSuccess = res.message;
        this.newGroupName = '';
        this.loadGroups();
      },
      error: (err) => {
        this.groupError = err.error?.message || 'Failed to create group';
      }
    });
  }

  addMember(): void {
    this.groupSuccess = '';
    this.groupError = '';

    if (!this.selectedGroupId || !this.addMemberEmail) {
      this.groupError = 'Select a group and enter an email';
      return;
    }

    this.groupService.addMember(this.selectedGroupId, this.addMemberEmail).subscribe({
      next: (res) => {
        this.groupSuccess = res.message;
        this.addMemberEmail = '';
        this.loadGroups();
      },
      error: (err) => {
        this.groupError = err.error?.message || 'Failed to add member';
      }
    });
  }

  removeMember(groupId: string, userId: string): void {
    if (!confirm('Remove this member from the group?')) return;

    this.groupService.removeMember(groupId, userId).subscribe({
      next: () => {
        this.groupSuccess = 'Member removed';
        this.loadGroups();
      },
      error: (err) => {
        this.groupError = err.error?.message || 'Failed to remove member';
      }
    });
  }

  deleteGroup(groupId: string): void {
    if (!confirm('Are you sure you want to delete this group?')) return;

    this.groupService.deleteGroup(groupId).subscribe({
      next: () => {
        this.groupSuccess = 'Group deleted';
        this.loadGroups();
      },
      error: (err) => {
        this.groupError = err.error?.message || 'Failed to delete group';
      }
    });
  }

  isGroupCreator(group: Group): boolean {
    const creatorId = typeof group.createdBy === 'object'
      ? group.createdBy._id
      : group.createdBy;
    return creatorId === this.user?._id;
  }
}