import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen gradient-primary">
        <div className="flex w-full">
            <Sidebar
  collapsed={sidebarCollapsed}
  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
  className={sidebarCollapsed ? "w-16" : "w-64"} // Add this if not present
/>
            
            <div className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-64"
            )}>
            <Header />
            
            <main className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                <Outlet />
                </div>
            </main>
            </div>
        </div>
        </div>
    );
};