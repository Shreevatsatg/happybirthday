
import birthdayRepository from '@/repositories/BirthdayRepository';
import NotificationService from '@/services/notificationservice';
import { Birthday } from '@/types/birthday';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

export const useBirthdays = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Birthday[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);

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
    if (settings.enabled) {
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
      const [fetchedBirthdays, unsynced] = await Promise.all([
        birthdayRepository.getBirthdays(),
        birthdayRepository.hasUnsyncedChanges(),
      ]);

      const processedBirthdays = fetchedBirthdays.map(b => ({
        ...b,
        ...calculateAgeAndDaysLeft(b.date),
      }));
      setBirthdays(processedBirthdays);
      setHasUnsyncedChanges(unsynced);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBirthdays();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchBirthdays();
      }
    });

    return () => {
      subscription.remove();
    };
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

  const addBirthday = async (name: string, date: string, note?: string, group?: 'family' | 'friend' | 'work' | 'other', linked_contact_id?: string, contact_phone_number?: string) => {
    try {
      const newBirthday = await birthdayRepository.addBirthday(name, date, note, group, linked_contact_id, contact_phone_number);
      await scheduleNotificationsForBirthday(newBirthday);
      await fetchBirthdays();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateBirthday = async (birthday: Birthday) => {
    try {
      await birthdayRepository.updateBirthday(birthday);
      await scheduleNotificationsForBirthday(birthday);
      await fetchBirthdays();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteBirthday = async (id: number) => {
    try {
      await birthdayRepository.deleteBirthday(id);
      await fetchBirthdays();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { birthdays, todaysBirthdays, upcomingBirthdays, loading, error, addBirthday, deleteBirthday, updateBirthday, refetch: fetchBirthdays, hasUnsyncedChanges };
};
