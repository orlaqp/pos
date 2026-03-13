import React from 'react';
import { render } from '@testing-library/react-native';

import SalesByEmployee, { toSalesByEmployeeRows } from './sales-by-employee';

describe('SalesByEmployee', () => {
    it('should render successfully', () => {
        const { container } = render(<SalesByEmployee />);
        expect(container).toBeTruthy();
    });

    it('maps and sorts sales by employee rows', () => {
        const rows = toSalesByEmployeeRows({
            employees: [
                { employeeName: 'Ada', amount: 10 } as any,
                { employeeName: 'Grace', amount: 25 } as any,
            ],
        } as any);

        expect(rows).toEqual([
            { employee: 'Grace', amount: 25 },
            { employee: 'Ada', amount: 10 },
        ]);
    });
});
