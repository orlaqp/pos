import formatISO from 'date-fns/formatISO';
import addDays from 'date-fns/addDays';
import intervalToDuration from 'date-fns/intervalToDuration';
import formatDuration from 'date-fns/formatDuration'


export class DatesService {

    static daysAgo(days: number) {
        return addDays(new Date(), Math.abs(days) * -1);
    }

    static toISO8601(date: Date) {
        return formatISO(date);
    }

    static humanReadableDuration(start: Date, end: Date) {
        const duration = intervalToDuration({ start, end });
        return formatDuration(duration);
    }

}