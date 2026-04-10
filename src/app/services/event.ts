import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CalendarEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(this.apiUrl);
  }

  getEvent(id: string): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<CalendarEvent>): Observable<{ message: string; event: CalendarEvent }> {
    return this.http.post<{ message: string; event: CalendarEvent }>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Partial<CalendarEvent>): Observable<{ message: string; event: CalendarEvent }> {
    return this.http.put<{ message: string; event: CalendarEvent }>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}