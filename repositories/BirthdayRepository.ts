import { User } from '@supabase/supabase-js';
import { LocalBirthdayRepository } from './LocalBirthdayRepository';
import { RemoteBirthdayRepository } from './RemoteBirthdayRepository';
import { Birthday } from '@/types/birthday';

class BirthdayRepository {
  private localRepository: LocalBirthdayRepository;
  private remoteRepository: RemoteBirthdayRepository;
  private isSyncing = false;

  constructor() {
    this.localRepository = new LocalBirthdayRepository();
    this.remoteRepository = new RemoteBirthdayRepository();
  }

  async getBirthdays(user: User | null): Promise<Birthday[]> {
    if (user) {
      return this.remoteRepository.getBirthdays(user.id);
    }
    return this.localRepository.getBirthdays();
  }

  async addBirthday(user: User | null, name: string, date: string, note?: string, group?: 'family' | 'friend' | 'work' | 'other'): Promise<Birthday> {
    if (user) {
      return this.remoteRepository.addBirthday(user.id, name, date, note, group);
    }
    return this.localRepository.addBirthday(name, date, note, group);
  }

  async deleteBirthday(user: User | null, id: number): Promise<void> {
    if (user) {
      return this.remoteRepository.deleteBirthday(id);
    }
    const birthdays = await this.localRepository.getBirthdays();
    const birthdayToDelete = birthdays.find(b => b.id === id);
    if (birthdayToDelete) {
      return this.localRepository.deleteBirthday(id);
    }
  }

  async updateBirthday(user: User | null, birthday: Birthday): Promise<void> {
    if (user) {
      await this.remoteRepository.updateBirthday(birthday);
    } else {
      await this.localRepository.updateBirthday(birthday);
    }
  }

  async syncBirthdays(user: User): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping.');
      return;
    }
    this.isSyncing = true;
    console.log('Starting birthday sync...');
    try {
      const localBirthdays = await this.localRepository.getBirthdays();
      if (localBirthdays.length > 0) {
        console.log(`Found ${localBirthdays.length} local birthdays to sync.`);
        // Use Promise.all to sync birthdays in parallel for efficiency
        await Promise.all(localBirthdays.map(birthday =>
          this.remoteRepository.addBirthday(user.id, birthday.name, birthday.date, birthday.note, birthday.group)
        ));
        console.log('Successfully synced all local birthdays to remote.');
        await this.localRepository.clearBirthdays();
        console.log('Cleared local birthdays.');
      } else {
        console.log('No local birthdays to sync.');
      }
    } catch (error) {
      console.error('An error occurred during birthday sync:', error);
      // Decide on error handling: maybe retry later or notify the user
    } finally {
      this.isSyncing = false;
      console.log('Birthday sync finished.');
    }
  }
}

const birthdayRepository = new BirthdayRepository();
export default birthdayRepository;