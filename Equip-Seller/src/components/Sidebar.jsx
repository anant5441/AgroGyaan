import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Plus, 
    Package, 
    Grid3X3, 
    Trash2, 
    ShoppingCart, 
    MessageCircle, 
    Bell, 
    User,
    TrendingUp,
    ChevronLeft,
    ChevronRight
    } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import { Button } from '@/components/ui/button';

    const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard Overview', path: '/' },
    { icon: Plus, label: 'Add Equipment Listing', path: '/add-equipment' },
    { icon: Package, label: 'View Equipment', path: '/equipment' },
    // { icon: Grid3X3, label: 'Browse by Type', path: '/browse-type' },
    // { icon: Trash2, label: 'Delete Equipment', path: '/delete-equipment' },
    { icon: ShoppingCart, label: 'Orders & Sales', path: '/orders' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Seller Profile', path: '/profile' },
    { icon: TrendingUp, label: 'Market Trends', path: '/market-trends' },
    ];

    export const Sidebar = ({ collapsed, onToggle }) => {
    return (
        <aside className={cn(
        "fixed left-0 top-0 h-screen gradient-primary border-r border-border/20 transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
        )}>
        <div className="flex flex-col h-full">
            {/* Logo and Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
            {!collapsed && (
                <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-semibold text-foreground">AgroGyaan</h1>
                </div>
            )}
            
            <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="hover:bg-white/10 transition-smooth"
            >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4">
            <ul className="space-y-2 px-3">
                {menuItems.map((item, index) => (
                <li key={index}>
                    <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-smooth group",
                        "hover:bg-white/10 hover:shadow-soft",
                        isActive 
                        ? "bg-white/20 text-primary shadow-card" 
                        : "text-foreground/80 hover:text-foreground"
                    )}
                    >
                    <item.icon className={cn(
                        "w-5 h-5 transition-smooth",
                        collapsed ? "mx-auto" : ""
                    )} />
                    {!collapsed && (
                        <span className="font-medium text-sm">{item.label}</span>
                    )}
                    </NavLink>
                </li>
                ))}
            </ul>
            </nav>

            {/* Footer */}
            {!collapsed && (
            <div className="p-4 border-t border-border/20">
                <div className="text-xs text-muted-foreground text-center">
                AgroGyaan Seller Dashboard
                </div>
            </div>
            )}
        </div>
        </aside>
    );
};