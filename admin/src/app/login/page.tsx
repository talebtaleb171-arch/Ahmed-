'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login({ email, password });
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل تسجيل الدخول');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mesh-bg">
            <div className="max-w-md w-full glass-card p-10 rounded-3xl animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center">
                    <div className="bg-white/10 p-4 rounded-2xl mb-6">
                        <img src="/logo.png" alt="Ahmed BMS Logo" className="h-28 w-auto" />
                    </div>
                    <h2 className="text-center text-4xl font-extrabold text-white tracking-tight">
                        Ahmed <span className="text-indigo-400">BMS</span>
                    </h2>
                    <p className="mt-4 text-center text-sm text-gray-300 font-medium">
                        لوحة التحكم الرئيسية للمسؤولين
                    </p>
                </div>
                <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">البريد الإلكتروني</label>
                            <input
                                type="email"
                                required
                                className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">كلمة المرور</label>
                            <input
                                type="password"
                                required
                                className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></span>
                                جاري التحميل...
                            </div>
                        ) : 'دخول للنظام'}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-8">
                        جميع الحقوق محفوظة © {new Date().getFullYear()} Ahmed BMS
                    </p>
                </form>
            </div>
        </div>
    );
}
