export type Birthday = {
  id: number;
  user_id: string;
  name: string;
  date: string;
  note?: string;
  group?: 'family' | 'friend' | 'work' | 'other';
  created_at: string;
  age?: number;
  daysLeft?: number;
};
