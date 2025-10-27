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
    return (data as Birthday[]).map(b => ({
      ...b,
      updated_at: b.updated_at || b.created_at,
    }));
  }

  async upsertBirthdays(birthdays: Birthday[]): Promise<Birthday[]> {
    const birthdaysToUpsert = birthdays.map(b => ({
      ...b,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('birthdays').upsert(birthdaysToUpsert).select();

    if (error) {
      throw new Error(error.message);
    }
    return data as Birthday[];
  }

  async deleteBirthdays(ids: number[]): Promise<void> {
    const { error } = await supabase.from('birthdays').delete().in('id', ids);

    if (error) {
      throw new Error(error.message);
    }
  }
}