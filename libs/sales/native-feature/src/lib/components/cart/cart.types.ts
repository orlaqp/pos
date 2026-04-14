export type ManualDraft = {
    scope: 'LINE' | 'ORDER';
    method: 'PERCENT' | 'AMOUNT';
    selectedDefinitionId?: string;
    percentValue: string;
    amountValue: string;
    reasonCode: string;
    reasonNote: string;
};

export type OverrideDraft = {
    finalPrice: string;
    reasonCode: string;
    reasonNote: string;
};

export const defaultManualDraft = (): ManualDraft => ({
    scope: 'LINE',
    method: 'PERCENT',
    selectedDefinitionId: undefined,
    percentValue: '',
    amountValue: '',
    reasonCode: '',
    reasonNote: '',
});

export const defaultOverrideDraft = (): OverrideDraft => ({
    finalPrice: '',
    reasonCode: '',
    reasonNote: '',
});
