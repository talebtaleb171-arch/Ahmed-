'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard, Wallet, History, LogOut, Users, Settings, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();

    if (loading) return <div>Loading...</div>;
    if (!user) return null; // Controlled by AuthProvider/Midleware logically

    const menuItems = [
        { name: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'الصناديق', icon: Wallet, href: '/dashboard/cashboxes' },
        { name: 'العمليات', icon: History, href: '/dashboard/transactions' },
        { name: 'الوكلاء', icon: Users, href: '/dashboard/users' },
        { name: 'أنواع السحوبات', icon: Settings, href: '/dashboard/withdrawal-types' },
        { name: 'التقارير', icon: FileText, href: '/dashboard/reports' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 text-white flex flex-col">
                <div className="p-6 flex justify-center border-b border-blue-800">
                    <img src="/logo.png" alt="Ahmed BMS Logo" className="h-20 w-auto" />
                </div>
                <nav className="flex-1 mt-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-6 py-3 transition-colors ${pathname === item.href ? 'bg-blue-800 border-r-4 border-blue-400' : 'hover:bg-blue-800'
                                }`}
                        >
                            <item.icon className="ml-3 h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-6 border-t border-blue-800">
                    <button
                        onClick={logout}
                        className="flex items-center text-gray-400 hover:text-white transition-colors w-full"
                    >
                        <LogOut className="ml-3 h-5 w-5" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm h-16 flex items-center px-8">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {menuItems.find(i => i.href === pathname)?.name || 'لوحة التحكم'}
                    </h1>
                    <div className="mr-auto text-sm text-gray-600">
                        مرحباً، {user.name}
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
