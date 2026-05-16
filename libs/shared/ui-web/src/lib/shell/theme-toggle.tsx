'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(nextTheme)} aria-label="Toggle theme">
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
        </Button>
    );
}
