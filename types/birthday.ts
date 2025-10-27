export type Birthday = {
  id: number;
  user_id: string;
  name: string;
  date: string;
  note?: string;
  group?: 'family' | 'friend' | 'work' | 'other';
  linked_contact_id?: string;
  contact_phone_number?: string;
  created_at: string;
  updated_at?: string;
  is_synced?: boolean;
  is_deleted?: boolean;
  age?: number;
  daysLeft?: number;
};
