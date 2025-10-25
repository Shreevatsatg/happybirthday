export interface Birthday {
  id: number;
  user_id: string;
  name: string;
  date: string;
  created_at: string;
  age?: number;
  daysLeft?: number;
}
