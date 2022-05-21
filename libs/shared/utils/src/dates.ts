import formatISO from 'date-fns/formatISO';
import addDays from 'date-fns/addDays';

export class DatesService {

    static daysAgo(days: number) {
        return addDays(new Date(), Math.abs(days) * -1);
    }

    static toISO8601(date: Date) {
        return formatISO(date);
    }

}