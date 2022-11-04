export interface ReportHeader {
    label: string;
    field: string;
    format?: 'integer' | 'float' | 'money' | ((value: unknown) => string);
    width: number;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
    sum?: boolean;
}