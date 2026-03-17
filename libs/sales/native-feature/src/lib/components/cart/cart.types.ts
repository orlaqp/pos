export type ManualDraft = {
    scope: 'LINE' | 'ORDER';
    method: 'PERCENT' | 'AMOUNT';
    percentValue: string;
    amountValue: string;
    reasonCode: string;
    reasonNote: string;
    approvalPin: string;
};

export type OverrideDraft = {
    finalPrice: string;
    reasonCode: string;
    reasonNote: string;
    approvalPin: string;
};

export const defaultManualDraft = (): ManualDraft => ({
    scope: 'LINE',
    method: 'PERCENT',
    percentValue: '',
    amountValue: '',
    reasonCode: '',
    reasonNote: '',
    approvalPin: '',
});

export const defaultOverrideDraft = (): OverrideDraft => ({
    finalPrice: '',
    reasonCode: '',
    reasonNote: '',
    approvalPin: '',
});
