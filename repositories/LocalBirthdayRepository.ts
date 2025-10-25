import AsyncStorage from '@react-native-async-storage/async-storage';
import { Birthday } from '@/types/birthday';

const BIRTHDAYS_STORAGE_KEY = 'birthdays';

export class LocalBirthdayRepository {
  async getBirthdays(): Promise<Birthday[]> {
    const json = await AsyncStorage.getItem(BIRTHDAYS_STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }

  async saveBirthdays(birthdays: Birthday[]): Promise<void> {
    const json = JSON.stringify(birthdays);
    await AsyncStorage.setItem(BIRTHDAYS_STORAGE_KEY, json);
  }

  async addBirthday(name: string, date: string, note?: string, group?: 'family' | 'friend' | 'work' | 'other'): Promise<Birthday> {
    const birthdays = await this.getBirthdays();
    const newBirthday: Birthday = {
      // a temporary id will be generated, it will be updated after sync
      id: new Date().getTime(),
      user_id: '', // No user_id for local birthdays
      name,
      date,
      note,
      group,
      created_at: new Date().toISOString(),
    };
    const updatedBirthdays = [...birthdays, newBirthday];
    await this.saveBirthdays(updatedBirthdays);
    return newBirthday;
  }

  async updateBirthday(updatedBirthday: Birthday): Promise<void> {
    const birthdays = await this.getBirthdays();
    const updatedBirthdays = birthdays.map(b => b.id === updatedBirthday.id ? updatedBirthday : b);
    await this.saveBirthdays(updatedBirthdays);
  }

  async deleteBirthday(id: number): Promise<void> {
    console.log('Deleting birthday from local storage with id:', id);
    const birthdays = await this.getBirthdays();
    const updatedBirthdays = birthdays.filter((b) => b.id !== id);
    await this.saveBirthdays(updatedBirthdays);
  }
}
