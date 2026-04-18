import { DataStore } from '@pos/shared/amplify';
import { syncEmployees, subscribeToEmployeeChanges } from './data-store-sync';

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    sortListBy: jest.fn(),
    logSyncDebug: jest.fn(),
    startSyncMeasure: jest.fn(() => jest.fn()),
    trackSyncSubscription: jest.fn(() => jest.fn()),
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        query: jest.fn(),
        observeQuery: jest.fn(() => ({
            subscribe: mockSubscribe,
        })),
    },
}));

describe('employees data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubscribe.mockReset();
    });

    it('hydrates from the first observeQuery emission even before sync completes', async () => {
        const dispatch = jest.fn();
        const employees = [
            {
                id: 'employee-1',
                firstName: 'Ana',
                lastName: 'Perez',
                active: true,
                updatedAt: '2026-04-03T10:00:00.000Z',
            },
        ] as any[];

        let observer: ((value: { isSynced: boolean; items: any[] }) => void) | undefined;
        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });
        const subscription = subscribeToEmployeeChanges(dispatch);
        observer?.({ isSynced: false, items: employees });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'employees/setAll',
            })
        );
        subscription.unsubscribe();
    });

    it('uses query for one-shot employee sync', async () => {
        const dispatch = jest.fn();
        const employees = [
            {
                id: 'employee-1',
                firstName: 'Ana',
                lastName: 'Perez',
                active: true,
                updatedAt: '2026-04-03T10:00:00.000Z',
            },
        ] as any[];

        (DataStore.query as jest.Mock).mockResolvedValueOnce(employees);

        await syncEmployees(dispatch);

        expect(DataStore.query).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'employees/setAll',
            })
        );
    });

    it('shares a single employee subscription across callers and replays cached data', () => {
        const firstDispatch = jest.fn();
        const secondDispatch = jest.fn();
        const unsubscribe = jest.fn();
        const employees = [
            {
                id: 'employee-1',
                firstName: 'Ana',
                lastName: 'Perez',
                active: true,
                updatedAt: '2026-04-03T10:00:00.000Z',
            },
        ] as any[];

        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;
        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe };
        });

        const firstSub = subscribeToEmployeeChanges(firstDispatch);
        observer?.({ isSynced: true, items: employees });
        firstDispatch.mockClear();

        const secondSub = subscribeToEmployeeChanges(secondDispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(secondDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'employees/setAll',
            })
        );

        firstSub.unsubscribe();
        expect(unsubscribe).not.toHaveBeenCalled();

        secondSub.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('filters deleted employee tombstones from sync updates', () => {
        const dispatch = jest.fn();
        let observer: ((value: { isSynced: boolean; items: any[] }) => void) | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });

        const subscription = subscribeToEmployeeChanges(dispatch);
        observer?.({
            isSynced: true,
            items: [
                { id: 'deleted-employee', firstName: 'Old', _deleted: true },
                { id: 'live-employee', firstName: 'Ana', _deleted: false },
            ],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'employees/setAll',
                payload: [expect.objectContaining({ id: 'live-employee' })],
            })
        );

        subscription.unsubscribe();
    });

    it('marks initial sync complete when an empty employee sync finishes', () => {
        const dispatch = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });

        const subscription = subscribeToEmployeeChanges(dispatch);
        observer?.({
            isSynced: true,
            items: [],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'employees/markInitialSyncComplete',
                payload: true,
            })
        );

        subscription.unsubscribe();
    });
});
