import { Birthday, BirthdayRepository } from '@/repositories/BirthdayRepository';

export class BirthdayService {
  private birthdayRepository: BirthdayRepository;

  constructor() {
    this.birthdayRepository = new BirthdayRepository();
  }

  private calculateAgeAndDaysLeft(birthday: Birthday): Birthday {
    const today = new Date();
    const birthDate = new Date(birthday.date);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
      nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const diffTime = Math.abs(nextBirthday.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { ...birthday, age, daysLeft: diffDays };
  }

  async getBirthdays(userId: string): Promise<Birthday[]> {
    const birthdays = await this.birthdayRepository.getBirthdays(userId);
    return birthdays.map(this.calculateAgeAndDaysLeft);
  }

  async addBirthday(userId: string, name: string, date: string): Promise<Birthday> {
    const newBirthday = await this.birthdayRepository.addBirthday(userId, name, date);
    return this.calculateAgeAndDaysLeft(newBirthday);
  }

  async deleteBirthday(id: number): Promise<void> {
    await this.birthdayRepository.deleteBirthday(id);
  }
}