// utils/scheduleTranslations.ts

export const dayCombinationMap: Record<string, string> = {
    // Single days
    'Mon': 'days.mon',
    'Tue': 'days.tue',
    'Wed': 'days.wed',
    'Thu': 'days.thu',
    'Fri': 'days.fri',

    // 2-day combinations
    'Mon/Tue': 'days.mon_tue',
    'Mon/Wed': 'days.mon_wed',
    'Mon/Thu': 'days.mon_thu',
    'Mon/Fri': 'days.mon_fri',
    'Tue/Wed': 'days.tue_wed',
    'Tue/Thu': 'days.tue_thu',
    'Tue/Fri': 'days.tue_fri',
    'Wed/Thu': 'days.wed_thu',
    'Wed/Fri': 'days.wed_fri',
    'Thu/Fri': 'days.thu_fri',

    // 3-day combinations
    'Mon/Tue/Wed': 'days.mon_tue_wed',
    'Mon/Tue/Thu': 'days.mon_tue_thu',
    'Mon/Tue/Fri': 'days.mon_tue_fri',
    'Mon/Wed/Thu': 'days.mon_wed_thu',
    'Mon/Wed/Fri': 'days.mon_wed_fri',
    'Mon/Thu/Fri': 'days.mon_thu_fri',
    'Tue/Wed/Thu': 'days.tue_wed_thu',
    'Tue/Wed/Fri': 'days.tue_wed_fri',
    'Tue/Thu/Fri': 'days.tue_thu_fri',
    'Wed/Thu/Fri': 'days.wed_thu_fri',

    // 4-day combinations
    'Mon/Tue/Wed/Thu': 'days.mon_tue_wed_thu',
    'Mon/Tue/Wed/Fri': 'days.mon_tue_wed_fri',
    'Mon/Tue/Thu/Fri': 'days.mon_tue_thu_fri',
    'Mon/Wed/Thu/Fri': 'days.mon_wed_thu_fri',
    'Tue/Wed/Thu/Fri': 'days.tue_wed_thu_fri',

    // All days
    'Mon/Tue/Wed/Thu/Fri': 'days.mon_tue_wed_thu_fri'
};

export function translateSchedule(
    scheduleString: string,
    t: (key: string) => string
): string {
    const [daysPart, timePart] = scheduleString.split(': ');

    // Normalize each day (e.g. "mon" → "Mon")
    const normalizedDays = daysPart
        .split('/')
        .map(day => {
            const trimmed = day.trim();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        })
        .join('/');

    // Lookup translation key, or fall back to namespace + normalizedDays
    const translationKey =
        dayCombinationMap[normalizedDays] ?? `sched_tool.days.${normalizedDays.replace(/\//g, '_').toLowerCase()}`;

    return `${t(translationKey)}: ${timePart}`;
}
