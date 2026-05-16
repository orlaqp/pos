import './global.css';
import { ReactNode } from 'react';

export const metadata = {
    title: 'POS Admin',
    description: 'Tenant-aware POS administration console',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
