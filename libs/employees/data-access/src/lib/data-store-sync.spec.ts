import { DataStore } from '@pos/shared/amplify';
import { syncEmployees, subscribeToEmployeeChanges } from './data-store-sync';

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
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
        mockSubscribe.mockImplementation((callback: typeof observer) => {
            observer = callback as typeof observer;
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

    it('uses observeQuery for one-shot employee sync without DataStore.query', async () => {
        const dispatch = jest.fn();
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

        mockSubscribe.mockImplementation((callback: (value: { items: any[] }) => void) => {
            callback({ items: employees } as any);
            return { unsubscribe };
        });

        syncEmployees(dispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'employees/setAll',
            })
        );
        expect(unsubscribe).toHaveBeenCalledTimes(1);
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
        mockSubscribe.mockImplementation((callback: typeof observer) => {
            observer = callback as typeof observer;
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
});
