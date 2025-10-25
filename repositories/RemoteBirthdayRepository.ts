import { supabase } from '@/services/supabase';
import { Birthday } from '@/types/birthday';

export class RemoteBirthdayRepository {
  async getBirthdays(userId: string): Promise<Birthday[]> {
    const { data, error } = await supabase
      .from('birthdays')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data as Birthday[];
  }

  async addBirthday(userId: string, name: string, date: string): Promise<Birthday> {
    const { data, error } = await supabase
      .from('birthdays')
      .insert({ user_id: userId, name, date })
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as Birthday;
  }

  async deleteBirthday(id: number): Promise<void> {
    const { error } = await supabase
      .from('birthdays')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}