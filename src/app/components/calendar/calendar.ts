import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../../models/event.model';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Output() dateClicked = new EventEmitter<Date>();
  @Output() eventClicked = new EventEmitter<CalendarEvent>();

  currentDate = new Date();
  weeks: CalendarDay[][] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  get monthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  ngOnInit(): void {
    this.buildCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.buildCalendar();
    }
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.weeks = [];
    let currentWeek: CalendarDay[] = [];
    const d = new Date(startDate);

    while (d <= endDate) {
      const dayDate = new Date(d);
      const dayEvents = this.getEventsForDate(dayDate);

      currentWeek.push({
        date: dayDate,
        dayNumber: dayDate.getDate(),
        isCurrentMonth: dayDate.getMonth() === month,
        isToday: dayDate.getTime() === today.getTime(),
        events: dayEvents
      });

      if (currentWeek.length === 7) {
        this.weeks.push(currentWeek);
        currentWeek = [];
      }

      d.setDate(d.getDate() + 1);
    }
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events.filter(event => {
      const eventDate = new Date(event.dateTime);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
  }

  previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1, 1
    );
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1, 1
    );
    this.buildCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.buildCalendar();
  }

  onDateClick(day: CalendarDay): void {
    this.dateClicked.emit(day.date);
  }

  onEventClick(event: CalendarEvent, e: MouseEvent): void {
    e.stopPropagation();
    this.eventClicked.emit(event);
  }

  getEventColorClass(event: CalendarEvent): string {
    if (event.isMandatory) return 'event-mandatory';
    switch (event.visibility) {
      case 'private': return 'event-private';
      case 'group': return 'event-group';
      case 'direct': return 'event-direct';
      default: return 'event-private';
    }
  }
}