import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.html',
  styleUrls: ['./event-card.css']
})
export class EventCardComponent {
  @Input() event!: CalendarEvent;
  @Output() edit = new EventEmitter<CalendarEvent>();

  get visibilityIcon(): string {
    switch (this.event.visibility) {
      case 'private': return 'fa-lock';
      case 'group': return 'fa-users';
      case 'direct': return 'fa-paper-plane';
      default: return 'fa-calendar';
    }
  }

  get creatorName(): string {
    return typeof this.event.createdBy === 'object'
      ? this.event.createdBy.name
      : 'Unknown';
  }

  get groupName(): string {
    if (!this.event.groupId) return '';
    return typeof this.event.groupId === 'object'
      ? this.event.groupId.name
      : '';
  }

  onClick(): void {
    this.edit.emit(this.event);
  }
}