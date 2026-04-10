import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event';
import { GroupService } from '../../services/group';
import { AuthService } from '../../services/auth';
import { CalendarEvent } from '../../models/event.model';
import { Group } from '../../models/group.model';

import { NavbarComponent } from '../../components/navbar/navbar';
import { CalendarComponent } from '../../components/calendar/calendar';
import { EventModalComponent } from '../../components/event-modal/event-modal';
import { EventCardComponent } from '../../components/event-card/event-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    CalendarComponent,
    EventModalComponent,
    EventCardComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  events: CalendarEvent[] = [];
  groups: Group[] = [];

  isModalOpen = false;
  selectedDate: Date | null = null;
  editEvent: CalendarEvent | null = null;

  selectedDayEvents: CalendarEvent[] = [];
  selectedDayLabel = '';

  successMessage = '';
  errorMessage = '';

  constructor(
    private eventService: EventService,
    private groupService: GroupService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadGroups();
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => { this.events = events; },
      error: () => { this.errorMessage = 'Failed to load events'; }
    });
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => { this.groups = groups; },
      error: () => {}
    });
  }

  onDateClicked(date: Date): void {
    this.selectedDate = date;
    this.editEvent = null;
    this.isModalOpen = true;

    this.selectedDayLabel = date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    this.selectedDayEvents = this.events.filter(ev => {
      const evDate = new Date(ev.dateTime);
      return evDate.getFullYear() === date.getFullYear() &&
             evDate.getMonth() === date.getMonth() &&
             evDate.getDate() === date.getDate();
    });
  }

  onEventClicked(event: CalendarEvent): void {
    this.editEvent = event;
    this.selectedDate = new Date(event.dateTime);
    this.isModalOpen = true;
  }

  onEventCardEdit(event: CalendarEvent): void {
    this.onEventClicked(event);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editEvent = null;
    this.selectedDate = null;
  }

  onSaveEvent(eventData: Partial<CalendarEvent>): void {
    if (this.editEvent?._id) {
      this.eventService.updateEvent(this.editEvent._id, eventData).subscribe({
        next: () => {
          this.showSuccess('Event updated successfully');
          this.closeModal();
          this.loadEvents();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update event';
        }
      });
    } else {
      this.eventService.createEvent(eventData).subscribe({
        next: () => {
          this.showSuccess('Event created successfully');
          this.closeModal();
          this.loadEvents();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create event';
        }
      });
    }
  }

  onDeleteEvent(eventId: string): void {
    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.showSuccess('Event deleted successfully');
        this.closeModal();
        this.loadEvents();
        this.selectedDayEvents = this.selectedDayEvents.filter(e => e._id !== eventId);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete event';
      }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  get upcomingEvents(): CalendarEvent[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.events
      .filter(ev => new Date(ev.dateTime) >= today)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, 5);
  }
}