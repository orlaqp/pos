import { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';

export function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <Card>
            <CardContent className="py-10 text-center">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
