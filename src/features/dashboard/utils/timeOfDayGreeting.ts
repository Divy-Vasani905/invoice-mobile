/**
 * Device-local greeting from a 24-hour clock.
 * 5:00–11:59 → Morning, 12:00–16:59 → Afternoon, 17:00–4:59 → Evening.
 */
export function getTimeOfDayGreeting(now = new Date()): string {
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good Morning,';
  }

  if (hour >= 12 && hour < 17) {
    return 'Good Afternoon,';
  }

  return 'Good Evening,';
}
