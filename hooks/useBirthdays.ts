import { useAuth } from '@/context/AuthContext';
import birthdayRepository from '@/repositories/BirthdayRepository';
import NotificationService from '@/services/notificationservice';
import { Birthday } from '@/types/birthday';
import { useCallback, useEffect, useState } from 'react';

export const useBirthdays = () => {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Birthday[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateAgeAndDaysLeft = (date: string) => {
    const birthdayDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthdayDate.getFullYear();
    const m = today.getMonth() - birthdayDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdayDate.getDate())) {
      age--;
    }

    const nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysLeft = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return { age, daysLeft };
  };

  const scheduleNotificationsForBirthday = async (birthday: Birthday) => {
  const settings = await NotificationService.getSettings();
  if (settings.enabled && user) {
    await NotificationService.scheduleAllNotificationsForBirthday(
      birthday.name,
      birthday.date,
      settings
    );
  }
};

  const fetchBirthdays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        await birthdayRepository.syncBirthdays(user);
      }
      const fetchedBirthdays = await birthdayRepository.getBirthdays(user);
      const processedBirthdays = fetchedBirthdays.map(b => ({
        ...b,
        ...calculateAgeAndDaysLeft(b.date),
      }));
      setBirthdays(processedBirthdays);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBirthdays();
  }, [fetchBirthdays]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todays: Birthday[] = [];
    const upcoming: Birthday[] = [];

    birthdays.forEach(birthday => {
      const birthdayDate = new Date(birthday.date);
      const isToday = birthdayDate.getMonth() === today.getMonth() && birthdayDate.getDate() === today.getDate();

      if (isToday) {
        todays.push(birthday);
      } else {
        upcoming.push(birthday);
      }
    });

    upcoming.sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0));

    setTodaysBirthdays(todays);
    setUpcomingBirthdays(upcoming);
  }, [birthdays]);

 const addBirthday = async (name: string, date: string, note?: string, group?: 'family' | 'friend' | 'work' | 'other') => {
  try {
    const newBirthday = await birthdayRepository.addBirthday(user, name, date, note, group);
    await scheduleNotificationsForBirthday(newBirthday);
    await fetchBirthdays();
  } catch (err: any) {
    setError(err.message);
  }
};

  const updateBirthday = async (birthday: Birthday) => {
  try {
    await birthdayRepository.updateBirthday(user, birthday);
    await scheduleNotificationsForBirthday(birthday);
    await fetchBirthdays();
  } catch (err: any) {
    setError(err.message);
  }
};

  const deleteBirthday = async (id: number) => {
    console.log('Attempting to delete birthday with id:', id);
    try {
      await birthdayRepository.deleteBirthday(user, id);
      await fetchBirthdays();
    } catch (err: any) {
      console.error('Error in deleteBirthday hook:', err);
      setError(err.message);
    }
  };

  return { birthdays, todaysBirthdays, upcomingBirthdays, loading, error, addBirthday, deleteBirthday, updateBirthday, refetch: fetchBirthdays };
};
