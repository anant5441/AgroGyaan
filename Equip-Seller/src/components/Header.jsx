import React, { useState } from 'react';
import { Search, Bell, User, Sun, Moon, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from "react-router-dom";
import { useTheme } from '@/contexts/ThemeContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';

    export const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border/20 shadow-soft">
        <div className="flex items-center justify-between px-6 py-3 ">
            {/* Search Bar */}
            <div className="flex-1 max-w-md ">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground " />
                <Input
                type="search"
                placeholder="Search equipment by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50 focus:bg-background transition-smooth"
                />
            </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hover:bg-muted/50 transition-smooth"
            >
                {theme === 'light' ? (
                <Moon className="w-4 h-4" />
                ) : (
                <Sun className="w-4 h-4" />
                )}
            </Button>

            {/* Messages */}
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="relative hover:bg-muted/50 transition-smooth"
                >
                <Link to="/messages">
                    <MessageCircle className="w-4 h-4" />
                    <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                    >
                    3
                    </Badge>
                </Link>
            </Button>

            {/* Notifications */}
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="relative hover:bg-muted/50 transition-smooth"
                >
                <Link to="/notifications">
                    <Bell className="w-4 h-4" />
                    <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                    >
                    5
                    </Badge>
                </Link>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 hover:bg-muted/50 transition-smooth"
                >
                    <div className="w-8 h-8 gradient-hero rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium hidden md:inline">John Farmer</span>
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm border-border/50">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Business Info</DropdownMenuItem>
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
        </div>
        </header>
    );
};