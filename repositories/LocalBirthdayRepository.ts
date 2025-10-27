import { Birthday } from '@/types/birthday';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIRTHDAYS_STORAGE_KEY = 'birthdays';

export class LocalBirthdayRepository {
  async getBirthdays(): Promise<Birthday[]> {
    const json = await AsyncStorage.getItem(BIRTHDAYS_STORAGE_KEY);
    const birthdays = json ? JSON.parse(json) : [];
    // Filter out birthdays that are marked as deleted
    return birthdays.filter((b: Birthday) => !b.is_deleted);
  }

  async getAllBirthdays(): Promise<Birthday[]> {
    const json = await AsyncStorage.getItem(BIRTHDAYS_STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }

  async saveBirthdays(birthdays: Birthday[]): Promise<void> {
    const json = JSON.stringify(birthdays);
    await AsyncStorage.setItem(BIRTHDAYS_STORAGE_KEY, json);
  }

  async addBirthday(name: string, date: string, note?: string, group?: 'family' | 'friend' | 'work' | 'other', linked_contact_id?: string, contact_phone_number?: string): Promise<Birthday> {
    const birthdays = await this.getAllBirthdays();
    const now = new Date().toISOString();
    const newBirthday: Birthday = {
      id: new Date().getTime(), // Temporary ID
      user_id: '', // No user_id for local birthdays initially
      name,
      date,
      note,
      group,
      linked_contact_id,
      contact_phone_number,
      created_at: now,
      updated_at: now,
      is_synced: false,
      is_deleted: false,
    };
    const updatedBirthdays = [...birthdays, newBirthday];
    await this.saveBirthdays(updatedBirthdays);
    return newBirthday;
  }

  async updateBirthday(updatedBirthday: Birthday): Promise<void> {
    const birthdays = await this.getAllBirthdays();
    const now = new Date().toISOString();
    const updatedBirthdays = birthdays.map(b =>
      b.id === updatedBirthday.id
        ? { ...updatedBirthday, is_synced: false, updated_at: now }
        : b
    );
    await this.saveBirthdays(updatedBirthdays);
  }

  async deleteBirthday(id: number): Promise<void> {
    const birthdays = await this.getAllBirthdays();
    const now = new Date().toISOString();
    const updatedBirthdays = birthdays.map(b =>
      b.id === id ? { ...b, is_deleted: true, is_synced: false, updated_at: now } : b
    );
    await this.saveBirthdays(updatedBirthdays);
  }

  async getUnsyncedBirthdays(): Promise<Birthday[]> {
    const birthdays = await this.getAllBirthdays();
    return birthdays.filter(b => !b.is_synced);
  }

  async clearBirthdays(): Promise<void> {
    await this.saveBirthdays([]);
  }

  async hasUnsyncedChanges(): Promise<boolean> {
    const birthdays = await this.getAllBirthdays();
    return birthdays.some(b => !b.is_synced);
  }

  async mergeAndSync(remoteBirthdays: Birthday[], userId: string): Promise<void> {
    const localBirthdays = await this.getAllBirthdays();
    const remoteBirthdaysMap = new Map(remoteBirthdays.map(b => [b.id, b]));
    const localBirthdaysMap = new Map(localBirthdays.map(b => [b.id, b]));

    const syncedBirthdays: Birthday[] = [];

    // Merge remote birthdays into local
    for (const remote of remoteBirthdays) {
      const local = localBirthdaysMap.get(remote.id);
      if (!local || new Date(remote.updated_at!) > new Date(local.updated_at!)) {
        syncedBirthdays.push({ ...remote, is_synced: true });
        localBirthdaysMap.delete(remote.id);
      }
    }

    // Add remaining local birthdays
    for (const local of localBirthdaysMap.values()) {
      if (!local.user_id) {
        local.user_id = userId;
      }
      syncedBirthdays.push(local);
    }

    await this.saveBirthdays(syncedBirthdays);
  }
}