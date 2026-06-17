import React from 'react';
import { getOrdersForStatuses, getRefundsForRange } from '@pos/reporting/data-access';
import { Order, OrderRefund, OrderStatus } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';

import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';
import moment from 'moment';
import i18next from 'i18next';
import { normalizeReportRange } from '../report-utils';

const paymentLabelByType: Record<string, string> = {
    CC: 'Card',
    CASH: 'Cash',
    CHECK: 'Check',
    EBT: 'EBT',
    CREDIT: 'Customer Credit',
};

const buildPaymentBreakdown = (
    payments: Array<{ type?: string | null; amount?: number | null }> | null | undefined
) =>
    (payments || [])
        .map((payment) => {
            const type = String(payment?.type || '').toUpperCase();
            const amount = Number(payment?.amount || 0);
            if (!type || amount <= 0) return undefined;
            return `${paymentLabelByType[type] || type}: $${amount.toFixed(2)}`;
        })
        .filter(Boolean)
        .join(', ');

/* eslint-disable-next-line */
export interface SalesProps {}

export const buildSalesRows = (orders: Order[], refunds: OrderRefund[] = []) => {
    const roundCurrency = (value: number) => Math.round(value * 100) / 100;
    const refundedAmountsByOrderId = refunds.reduce<Record<string, number>>((acc, refund) => {
        const orderId = String(refund.orderId || '').trim();
        if (!orderId) {
            return acc;
        }

        acc[orderId] = Number(acc[orderId] || 0) + Number(refund.refundAmount || 0);
        return acc;
    }, {});

    return [...orders]
        .sort((left, right) => {
            const leftCreated =
                String(left.createdAt || left.orderDate || left.updatedAt || '');
            const rightCreated =
                String(right.createdAt || right.orderDate || right.updatedAt || '');
            return rightCreated.localeCompare(leftCreated);
        })
        .map((order) => {
            const refundedAmount = Number(
                refundedAmountsByOrderId[String(order.id || '')] || 0
            );

            return {
                orderNo: order.orderNo,
                orderDate: moment(order.orderDate).format('YYYY-MM-DD hh:MM'),
                createdAt: order.createdAt || order.orderDate || order.updatedAt,
                employee: order.createdBy?.name || order.employeeName,
                paymentBreakdown: buildPaymentBreakdown(order.paymentInfo?.payments),
                amount: roundCurrency(
                    Math.max(0, Number(order.total || 0) - refundedAmount)
                ),
            };
        });
};

export function Sales(_props: SalesProps) {
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Number', 'Number'), field: 'orderNo', width: 3 },
        { label: t('REPORT_Header_Employee', 'Employee'), field: 'employee', width: 3 },
        { label: t('REPORT_Header_Payments', 'Payments'), field: 'paymentBreakdown', width: 3 },
        { label: t('REPORT_Header_Amount', 'Amount'), field: 'amount', width: 1, format: 'money', align: 'right', sum: true },
    ];

    const getData = async (range: DateRange) => {
        const normalizedRange = normalizeReportRange(range);
        const [orders, refunds] = await Promise.all([
            getOrdersForStatuses({
                statuses: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
                range: normalizedRange,
            }),
            getRefundsForRange({ range: normalizedRange }),
        ]);

        return buildSalesRows(orders, refunds);
    };

    return (
        <ReportViewer
            title={t('REPORT_SaleListTitle', 'Sale List')}
            subtitle={t(
                'REPORT_SaleListSubtitle',
                'Review paid transactions and totals for the selected period.'
            )}
            total={0}
            getData={getData}
            headers={headers}
        />
    );
}

export default Sales;
