import { DateRange } from '@pos/shared/ui-native';

export const normalizeReportRange = (range: DateRange): DateRange => ({
    ...range,
    startDate: range.startDate.clone().startOf('day'),
    endDate: range.endDate.clone().endOf('day'),
});
