import { toSalesByEmployeeRows } from './sales-by-employee';

describe('SalesByEmployee', () => {
    it('maps and sorts sales by employee rows', () => {
        const rows = toSalesByEmployeeRows({
            employees: [
                { employeeName: 'Ada', amount: 10 } as any,
                { employeeName: 'Grace', amount: 25 } as any,
            ],
        } as any);

        expect(rows).toEqual([
            { employee: 'Grace', amount: 25, tax: 0 },
            { employee: 'Ada', amount: 10, tax: 0 },
        ]);
    });
});
