import { useAuth } from '@/context/AuthContext';
import BirthdayRepository from '@/repositories/BirthdayRepository';
import { Birthday } from '@/types/birthday';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useBirthdays = () => {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Birthday[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const birthdayRepository = useMemo(() => new BirthdayRepository(), []);

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

  const fetchBirthdays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
  }, [user, birthdayRepository]);

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

  const addBirthday = async (name: string, date: string) => {
    try {
      await birthdayRepository.addBirthday(user, name, date);
      fetchBirthdays();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteBirthday = async (id: number) => {
    try {
      await birthdayRepository.deleteBirthday(user, id);
      fetchBirthdays();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { todaysBirthdays, upcomingBirthdays, loading, error, addBirthday, deleteBirthday, refetch: fetchBirthdays };
};
