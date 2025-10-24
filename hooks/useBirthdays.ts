import { useEffect, useState } from 'react';
import { Birthday, BirthdayService } from '@/services/BirthdayService';

export const useBirthdays = () => {
  const [todaysBirthdays, setTodaysBirthdays] = useState<Birthday[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual user ID from auth context
        const userId = 'some-user-id'; 
        const birthdayService = new BirthdayService();
        const allBirthdays = await birthdayService.getBirthdays(userId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todays: Birthday[] = [];
        const upcoming: Birthday[] = [];

        allBirthdays.forEach(birthday => {
          const birthdayDate = new Date(birthday.date);
          const isToday = birthdayDate.getMonth() === today.getMonth() && birthdayDate.getDate() === today.getDate();

          if (isToday) {
            todays.push(birthday);
          } else {
            upcoming.push(birthday);
          }
        });

        // Sort upcoming birthdays by days left
        upcoming.sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0));

        setTodaysBirthdays(todays);
        setUpcomingBirthdays(upcoming);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  return { todaysBirthdays, upcomingBirthdays, loading, error };
};
