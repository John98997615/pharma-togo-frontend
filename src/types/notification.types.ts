// src/types/notification.types.ts
export interface Notification {
  id: number;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: any;
  read_at?: string;
  created_at: string;
  updated_at: string;
}