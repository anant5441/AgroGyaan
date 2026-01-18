import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    TrendingUp,
    MapPin,
    MessageCircle,
    Settings,
    Search,
    Bell,
    User,
    ChevronRight,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Marketplace', path: '/marketplace' },
    { icon: Package, label: 'My Cart', path: '/cart' },
    { icon: Package, label: 'My Orders', path: '/orders' },
    { icon: TrendingUp, label: 'Price Tracker', path: '/price-tracker' },
    { icon: MapPin, label: 'Traceability', path: '/traceability' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const DashboardLayout = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    // Get user from session storage
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userName = user.name || 'Agro User';
    const displayRole = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Buyer';

    return (
        <div className="min-h-screen bg-gradient-background">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-gradient-sidebar shadow-soft">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                            <span className="text-primary font-bold">🌾</span>
                        </div>
                        <span className="text-primary-foreground font-bold text-xl">AGROGYAAN</span>
                    </div>

                    <nav className="space-y-2">
                        {sidebarItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary-foreground/20 text-primary-foreground shadow-glow'
                                        : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-primary-foreground/20">
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-200"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                {/* Top Bar */}
                <header className="h-16 bg-card/50 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search crops, farmers, orders..."
                                className="pl-10 bg-card border-2 border-primary/20 rounded-2xl focus:border-primary focus:ring-0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            onClick={() => navigate('/notifications')}
                        >
                            <Bell className="w-5 h-5" />
                            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                                3
                            </Badge>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-3 hover:bg-primary/10 transition-all duration-300 hover:shadow-soft p-2 rounded-2xl">
                                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                        <User className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font--semibold text-foreground">{userName}</div>
                                        <Badge variant="secondary" className="text-xs bg-gradient-accent text-accent-foreground">{displayRole}</Badge>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                                <DropdownMenuItem>Billing</DropdownMenuItem>
                                <DropdownMenuItem>Help & Support</DropdownMenuItem>
                                <DropdownMenuItem>Sign Out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
            <Toaster />
        </div>
    );
};

export default DashboardLayout;
