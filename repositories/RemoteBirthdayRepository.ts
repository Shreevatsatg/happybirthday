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

  async addBirthday(userId: string, name: string, date: string, note?: string, group?: 'family' | 'friend' | 'work' | 'other', linked_contact_id?: string, contact_phone_number?: string): Promise<Birthday> {
    const { data, error } = await supabase
      .from('birthdays')
      .insert({ user_id: userId, name, date, note, group, linked_contact_id, contact_phone_number })
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as Birthday;
  }

  async updateBirthday(birthday: Birthday): Promise<Birthday> {
    const { data, error } = await supabase
      .from('birthdays')
      .update({ name: birthday.name, date: birthday.date, note: birthday.note, group: birthday.group, linked_contact_id: birthday.linked_contact_id, contact_phone_number: birthday.contact_phone_number })
      .eq('id', birthday.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as Birthday;
  }

  async deleteBirthday(id: number): Promise<void> {
    console.log('Deleting birthday from remote storage with id:', id);
    const { error } = await supabase
      .from('birthdays')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting birthday from remote:', error);
      throw new Error(error.message);
    }
  }
}
