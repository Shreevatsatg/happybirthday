import { User } from '@supabase/supabase-js';
import { LocalBirthdayRepository } from './LocalBirthdayRepository';
import { RemoteBirthdayRepository } from './RemoteBirthdayRepository';
import { Birthday } from '@/types/birthday';

class BirthdayRepository {
  private localRepository: LocalBirthdayRepository;
  private remoteRepository: RemoteBirthdayRepository;

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
}

export default BirthdayRepository;