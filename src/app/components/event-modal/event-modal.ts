import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CalendarEvent } from '../../models/event.model';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { GroupService } from '../../services/group';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './event-modal.html',
  styleUrls: ['./event-modal.css']
})
export class EventModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() selectedDate: Date | null = null;
  @Input() editEvent: CalendarEvent | null = null;
  @Input() groups: Group[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<CalendarEvent>>();
  @Output() delete = new EventEmitter<string>();

  form!: FormGroup;
  searchResults: User[] = [];
  selectedUsers: User[] = [];
  searchEmail = '';
  isSearching = false;

  get isEdit(): boolean {
    return !!this.editEvent;
  }

  constructor(private fb: FormBuilder, private groupService: GroupService) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.initForm();
      if (this.editEvent) {
        this.populateForm();
      } else if (this.selectedDate) {
        const dateStr = this.formatDate(this.selectedDate);
        this.form.patchValue({ dateTime: dateStr });
      }
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      dateTime: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required],
      location: [''],
      visibility: ['private', Validators.required],
      groupId: [''],
      isMandatory: [false]
    });
    this.selectedUsers = [];
    this.searchResults = [];
    this.searchEmail = '';
  }

  populateForm(): void {
    if (!this.editEvent) return;
    const ev = this.editEvent;
    this.form.patchValue({
      title: ev.title,
      description: ev.description,
      dateTime: this.formatDate(new Date(ev.dateTime)),
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location,
      visibility: ev.visibility,
      groupId: ev.groupId?._id || ev.groupId || '',
      isMandatory: ev.isMandatory
    });
    if (ev.visibility === 'direct' && ev.sharedWith) {
      this.selectedUsers = ev.sharedWith.map((u: any) =>
        typeof u === 'object' ? u : { _id: u, name: '', email: '' }
      );
    }
  }

  formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onVisibilityChange(): void {
    const v = this.form.get('visibility')?.value;
    if (v !== 'group') this.form.patchValue({ groupId: '' });
    if (v !== 'direct') {
      this.selectedUsers = [];
      this.searchEmail = '';
      this.searchResults = [];
    }
  }

  searchUser(): void {
    if (this.searchEmail.length < 2) {
      this.searchResults = [];
      return;
    }
    this.isSearching = true;
    this.groupService.searchUsers(this.searchEmail).subscribe({
      next: (users) => {
        this.searchResults = users.filter(u =>
          !this.selectedUsers.some(s => s._id === u._id)
        );
        this.isSearching = false;
      },
      error: () => { this.isSearching = false; }
    });
  }

  addUser(user: User): void {
    if (!this.selectedUsers.some(u => u._id === user._id)) {
      this.selectedUsers.push(user);
    }
    this.searchEmail = '';
    this.searchResults = [];
  }

  removeUser(userId: string): void {
    this.selectedUsers = this.selectedUsers.filter(u => u._id !== userId);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const val = this.form.value;
    const eventData: Partial<CalendarEvent> = {
      title: val.title,
      description: val.description || '',
      dateTime: val.dateTime,
      startTime: val.startTime,
      endTime: val.endTime,
      location: val.location || '',
      visibility: val.visibility,
      isMandatory: val.isMandatory
    };

    if (val.visibility === 'group') {
      eventData.groupId = val.groupId;
    }
    if (val.visibility === 'direct') {
      eventData.sharedWith = this.selectedUsers.map(u => u._id);
    }

    this.save.emit(eventData);
  }

  onDelete(): void {
    if (this.editEvent?._id && confirm('Are you sure you want to delete this event?')) {
      this.delete.emit(this.editEvent._id);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}