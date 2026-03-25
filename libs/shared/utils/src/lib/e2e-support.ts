export type E2EConfig = {
    enabled: boolean;
    seedTenant: boolean;
    cleanupOnExit: boolean;
    printerSpy: boolean;
};

export type E2EPrintJob = {
    timestamp: string;
    printerIdentifier?: string;
    orderId?: string;
    orderNo?: string;
    copyType?: string;
    copyLabel?: string;
    total?: number;
    receiptText: string;
    paymentSummaryText?: string;
};

export type E2EState = {
    config: E2EConfig;
    seedStatus: string;
    lastResetAt?: string;
    lastCleanupAt?: string;
    printJobs: E2EPrintJob[];
};

type Listener = () => void;

const listeners = new Set<Listener>();

const state: E2EState = {
    config: {
        enabled: false,
        seedTenant: false,
        cleanupOnExit: false,
        printerSpy: false,
    },
    seedStatus: 'idle',
    printJobs: [],
};

const emit = () => {
    listeners.forEach((listener) => listener());
};

export const subscribeToE2EState = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const getE2EState = (): E2EState => ({
    ...state,
    config: { ...state.config },
    printJobs: [...state.printJobs],
});

export const setE2ESeedStatus = (seedStatus: string) => {
    state.seedStatus = seedStatus;
    emit();
};

export const activateE2EMode = (partial: Partial<E2EConfig> = {}) => {
    state.config = {
        ...state.config,
        enabled: true,
        seedTenant: partial.seedTenant ?? state.config.seedTenant,
        cleanupOnExit: partial.cleanupOnExit ?? state.config.cleanupOnExit,
        printerSpy: partial.printerSpy ?? state.config.printerSpy,
    };
    emit();
};

export const deactivateE2EMode = () => {
    state.config = {
        enabled: false,
        seedTenant: false,
        cleanupOnExit: false,
        printerSpy: false,
    };
    emit();
};

export const markE2EResetComplete = () => {
    state.lastResetAt = new Date().toISOString();
    emit();
};

export const markE2ECleanupComplete = () => {
    state.lastCleanupAt = new Date().toISOString();
    emit();
};

export const clearE2EPrintJobs = () => {
    state.printJobs = [];
    emit();
};

export const recordE2EPrintJob = (job: E2EPrintJob) => {
    state.printJobs = [...state.printJobs, job].slice(-20);
    emit();
};

export const isE2EEnabled = () => state.config.enabled;

export const isE2EPrinterSpyEnabled = () =>
    state.config.enabled && state.config.printerSpy;
