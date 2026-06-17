import React from 'react';
import { render } from '@testing-library/react-native';

import CustomerList from './customer-list';

jest.mock('@pos/theme/native', () => ({
    getThemeColors: () => ({
        primary: '#4aa3eb',
        grey1: '#f3f4f6',
        grey2: '#9ca3af',
        grey3: '#6b7280',
        grey4: '#374151',
        grey5: '#1f2937',
    }),
    useSharedStyles: () => ({
        page: {},
        detailsPage: {},
    }),
}));

jest.mock('react-redux', () => ({
    useSelector: (selector: (state: unknown) => unknown) =>
        selector({
            customers: {
                ids: [],
                entities: {},
                selected: undefined,
                ledger: [],
                loadingStatus: 'loaded',
                filteredList: [],
            },
        } as never),
}));

jest.mock('@pos/store', () => ({
    useAppDispatch: () => jest.fn(),
}));

describe('CustomerList', () => {
    it('renders the generic management list surface', () => {
        const { UNSAFE_root } = render(<CustomerList />);
        expect(UNSAFE_root).toBeTruthy();
    });
});
