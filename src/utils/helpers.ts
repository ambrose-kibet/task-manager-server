import * as moment from 'moment';

export const calculateLongestStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;

  // Normalize the dates to midnight
  const normalizedDates = dates.map((date) => moment(date).startOf('day'));

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < normalizedDates.length; i++) {
    const currentDate = normalizedDates[i];
    const previousDate = normalizedDates[i - 1];

    // Calculate the difference in days
    const diffDays = currentDate.diff(previousDate, 'days');

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
};
