import intervalToDuration from 'date-fns/intervalToDuration';
import formatDuration from 'date-fns/formatDuration'
import moment from 'moment';

export class DatesService {

    static daysAgo(days: number) {
        return moment().subtract(days); //  addDays(new Date(), Math.abs(days) * -1);
    }

    static toISO8601(m: moment.Moment) {
        return m.toISOString();
    }

    static humanReadableDuration(start: Date, end: Date) {
        const duration = intervalToDuration({ start, end });
        return formatDuration(duration);
    }

}