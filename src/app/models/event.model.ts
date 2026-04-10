export interface CalendarEvent {
  _id?: string;
  title: string;
  description: string;
  dateTime: string;
  startTime: string;
  endTime: string;
  location: string;
  createdBy: any;
  visibility: 'private' | 'group' | 'direct';
  groupId: any;
  sharedWith: any[];
  isMandatory: boolean;
  createdAt?: string;
  updatedAt?: string;
}