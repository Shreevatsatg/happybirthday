import { Birthday } from '@/types/birthday';
import { User } from '@supabase/supabase-js';
import { LocalBirthdayRepository } from './LocalBirthdayRepository';
import { RemoteBirthdayRepository } from './RemoteBirthdayRepository';
import NetInfo from '@react-native-community/netinfo';

class BirthdayRepository {
  private localRepository: LocalBirthdayRepository;
  private remoteRepository: RemoteBirthdayRepository;
  private isSyncing = false;
  private user: User | null = null;

  constructor() {
    this.localRepository = new LocalBirthdayRepository();
    this.remoteRepository = new RemoteBirthdayRepository();
    this.init();
  }

  private init() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.syncBirthdays();
      }
    });
  }

  setUser(user: User | null) {
    this.user = user;
    if (user) {
      this.syncBirthdays();
    }
  }

  async getBirthdays(): Promise<Birthday[]> {
    return this.localRepository.getBirthdays();
  }

  async addBirthday(name: string, date: string, note?: string, group?: 'family' | 'friend' | 'work' | 'other', linked_contact_id?: string, contact_phone_number?: string): Promise<Birthday> {
    const newBirthday = await this.localRepository.addBirthday(name, date, note, group, linked_contact_id, contact_phone_number);
    this.syncBirthdays();
    return newBirthday;
  }

  async updateBirthday(birthday: Birthday): Promise<void> {
    await this.localRepository.updateBirthday(birthday);
    this.syncBirthdays();
  }

  async deleteBirthday(id: number): Promise<void> {
    await this.localRepository.deleteBirthday(id);
    this.syncBirthdays();
  }

  async hasUnsyncedChanges(): Promise<boolean> {
    return this.localRepository.hasUnsyncedChanges();
  }

  async syncBirthdays(): Promise<void> {
    if (this.isSyncing || !this.user || !NetInfo.fetch().then(state => state.isConnected)) {
      return;
    }

    this.isSyncing = true;
    try {
      const unsyncedBirthdays = await this.localRepository.getUnsyncedBirthdays();
      if (unsyncedBirthdays.length > 0) {
        const toUpsert = unsyncedBirthdays.filter(b => !b.is_deleted).map(b => ({ ...b, user_id: this.user!.id }));
        const toDelete = unsyncedBirthdays.filter(b => b.is_deleted).map(b => b.id);

        if (toUpsert.length > 0) {
          await this.remoteRepository.upsertBirthdays(toUpsert);
        }
        if (toDelete.length > 0) {
          await this.remoteRepository.deleteBirthdays(toDelete);
        }
      }

      const remoteBirthdays = await this.remoteRepository.getBirthdays(this.user.id);
      await this.localRepository.mergeAndSync(remoteBirthdays, this.user.id);

    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

const birthdayRepository = new BirthdayRepository();
export default birthdayRepository;