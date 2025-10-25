import { Birthday } from '@/types/birthday';
import { User } from '@supabase/supabase-js';
import { LocalBirthdayRepository } from './LocalBirthdayRepository';
import { RemoteBirthdayRepository } from './RemoteBirthdayRepository';

export default class BirthdayRepository {
  private localRepository = new LocalBirthdayRepository();
  private remoteRepository = new RemoteBirthdayRepository();

  async getBirthdays(user: User | null): Promise<Birthday[]> {
    if (user) {
      const remoteBirthdays = await this.remoteRepository.getBirthdays(user.id);
      await this.localRepository.saveBirthdays(remoteBirthdays);
      return remoteBirthdays;
    } else {
      return this.localRepository.getBirthdays();
    }
  }

  async addBirthday(user: User | null, name: string, date: string): Promise<Birthday> {
    if (user) {
      const newBirthday = await this.remoteRepository.addBirthday(user.id, name, date);
      const localBirthdays = await this.localRepository.getBirthdays();
      await this.localRepository.saveBirthdays([...localBirthdays, newBirthday]);
      return newBirthday;
    } else {
      return this.localRepository.addBirthday(name, date);
    }
  }

  async deleteBirthday(user: User | null, id: number): Promise<void> {
    if (user) {
      await this.remoteRepository.deleteBirthday(id);
      const localBirthdays = await this.localRepository.getBirthdays();
      const updatedBirthdays = localBirthdays.filter((b) => b.id !== id);
      await this.localRepository.saveBirthdays(updatedBirthdays);
    } else {
      await this.localRepository.deleteBirthday(id);
    }
  }
}
