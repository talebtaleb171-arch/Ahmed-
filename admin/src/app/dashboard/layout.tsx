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
        { text: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
        { text: 'الصناديق', icon: Wallet, href: '/dashboard/cashboxes' },
        { text: 'العمليات', icon: History, href: '/dashboard/transactions' },
        { text: 'الوكلاء', icon: Users, href: '/dashboard/users' },
        { text: 'أنواع السحوبات', icon: Settings, href: '/dashboard/withdrawal-types' },
        { text: 'التقارير', icon: FileText, href: '/dashboard/reports' },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <div className="w-72 premium-gradient text-white flex flex-col shadow-2xl relative overflow-hidden">
                {/* Decorative mesh overlay for sidebar */}
                <div className="absolute inset-0 opacity-10 mesh-bg pointer-events-none"></div>

                <div className="p-8 relative">
                    <div className="flex items-center space-x-4 space-x-reverse mb-8">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
                            <img src="/logo.png" alt="Ahmed BMS" className="h-10 w-auto" />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter">
                            Ahmed <span className="text-indigo-400">BMS</span>
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 relative">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                    ? "bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-md border border-white/5"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ml-4 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                <span className={`font-bold ${isActive ? "text-white" : "group-hover:text-white"}`}>{item.text}</span>
                                {isActive && (
                                    <div className="mr-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto relative">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-6 py-4 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-3xl transition-all duration-300 font-bold border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-5 h-5 ml-4" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <span className="text-indigo-600 font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                        </div>
                        <span className="font-bold text-gray-800">أهلاً بك، {user.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-100">
                            النظام يعمل بشكل مثالي
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-10">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
