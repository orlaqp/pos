import { getSalesSummaryForRange } from '@pos/reporting/data-access';
import { DateRange, UIOverlaySelect } from '@pos/shared/ui-native';
import { sortDescListBy } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { EACH, POUND, selectAllUnitOfMeasures } from '@pos/unit-of-measures/data-access';
import { ButtonGroup } from '@rneui/themed';
import React, { useState } from 'react';
import { SalesSummary } from '@pos/shared/models';

import { View } from 'react-native';
import { useSelector } from 'react-redux';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';

/* eslint-disable-next-line */
export interface SalesByProductProps {
}

export const toSalesByProductRows = (
    summary: SalesSummary | undefined,
    unitName: string | undefined
) => {
    const list = summary?.products?.filter((p) => p?.unitOfMeasure === unitName);
    sortDescListBy(list as any, 'quantity');
    return list?.map((e) => ({
        product: `${e?.productName} (${e?.unitOfMeasure})`,
        amount: e?.unitOfMeasure === EACH ? e.quantity : e?.quantity.toFixed(2),
    }));
};

export const normalizeSalesByProductRange = (range: DateRange): DateRange => ({
    ...range,
    startDate: range.startDate.clone().startOf('day'),
    endDate: range.endDate.clone().endOf('day'),
});

export const createUnitChangeHandler = (
    setSelectedIndex: (index: number) => void
) => (value: number) => {
    setSelectedIndex(value);
};

export function SalesByProduct(props: SalesByProductProps) {
    const styles = useSharedStyles();
    const headers: ReportHeader[] = [
        { label: 'Product', field: 'product', width: 5 },
        { label: 'Quantity', field: 'amount', width: 1, align: 'right' },
    ];
    const unitOfMeasures = useSelector(selectAllUnitOfMeasures);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const onUnitChange = createUnitChangeHandler(setSelectedIndex);

    const getData = (range: DateRange) => {
        const normalizedRange = normalizeSalesByProductRange(range);

        return getSalesSummaryForRange('PAID', normalizedRange).then((summary) =>
            toSalesByProductRows(summary, unitOfMeasures[selectedIndex]?.name)
        );
    };

    return (
        <View style={styles.page}>
            <View style={{ justifyContent: 'center' }}>
                <ButtonGroup
                    buttons={unitOfMeasures?.map((u, index) => u.name)}
                    selectedIndex={selectedIndex}
                    onPress={onUnitChange}
                    containerStyle={{ marginBottom: 20, backgroundColor: 'transparent', borderWidth: 0 }}
                />
            </View>
            <ReportViewer getData={getData} headers={headers} />
        </View>
    );
}
