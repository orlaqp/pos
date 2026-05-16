'use client';

import { Bell, Search, User } from 'lucide-react';
import { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { ThemeToggle } from './theme-toggle';

type AdminHeaderProps = {
    searchValue: string;
    tenantSelector: ReactNode;
    userName: string;
    userEmail: string;
    onSearchChange: (value: string) => void;
};

export function AdminHeader({
    searchValue,
    tenantSelector,
    userName,
    userEmail,
    onSearchChange,
}: AdminHeaderProps) {
    return (
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b bg-background px-6 py-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
                {tenantSelector}
                <div className="relative min-w-64 max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search current view..."
                        value={searchValue}
                        className="bg-muted/50 pl-9"
                        onChange={(event) => onSearchChange(event.target.value)}
                    />
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" aria-label="Notifications">
                    <Bell />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-10 rounded-full p-0">
                            <Avatar>
                                <AvatarImage src="" alt={userName} />
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">{userName}</span>
                                <span className="text-xs text-muted-foreground">{userEmail}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
