import React from 'react';
import { UIOrderSummaryPanel } from '@pos/shared/ui-native';

import type {
    OrderSummaryViewModel,
    SummaryDiscountBreakdownItem,
} from './cart.logic';
import type { CartStyles } from './cart.styles';

interface OrderSummaryPanelProps {
    styles: CartStyles;
    orderSummary: OrderSummaryViewModel;
    discountBreakdown: SummaryDiscountBreakdownItem[];
    title?: string;
    hint?: string;
    footer?: React.ReactNode;
    scrollStyle?: object;
    scrollContentStyle?: object;
    contentTestID?: string;
    plain?: boolean;
}

export function OrderSummaryPanel({
    orderSummary,
    discountBreakdown,
    title = 'Order summary',
    hint = 'Review the order with the customer before printing.',
    footer,
    scrollStyle,
    scrollContentStyle,
    contentTestID,
    plain = false,
}: OrderSummaryPanelProps) {
    return (
        <UIOrderSummaryPanel
            orderSummary={orderSummary}
            discountBreakdown={discountBreakdown}
            title={title}
            hint={hint}
            footer={footer}
            scrollStyle={scrollStyle}
            scrollContentStyle={scrollContentStyle}
            contentTestID={contentTestID}
            plain={plain}
        />
    );
}

export default OrderSummaryPanel;
