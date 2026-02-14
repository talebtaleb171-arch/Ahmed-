'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CreditCard, ArrowUpRight } from 'lucide-react';

const useDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [boxesRes, statsRes, transactionsRes] = await Promise.all([
                    api.get('/cashboxes'),
                    api.get('/transactions/stats'),
                    api.get('/transactions?limit=5')
                ]);

                const boxes = boxesRes.data;
                const mainBox = boxes.find((b: any) => b.type === 'main');
                const statsData = statsRes.data;
                const transactionsData = transactionsRes.data;

                setStats({
                    mainBalance: mainBox?.balance || 0,
                    subBoxesCount: boxes.filter((b: any) => b.type === 'sub').length,
                    pendingTransactions: statsData.pending,
                    totalSubBalance: boxes.filter((b: any) => b.type === 'sub').reduce((acc: number, b: any) => acc + parseFloat(b.balance), 0),
                    cashboxes_count: boxes.length,
                    total_balance: boxes.reduce((acc: number, b: any) => acc + parseFloat(b.balance), 0),
                    daily_transactions: transactionsData.length,
                });
                setRecentTransactions(transactionsData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return { stats, recentTransactions, isLoading };
};

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="glass-card p-8 rounded-[2rem] border-white/40 hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-start justify-between">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 shadow-inner`}>
                <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <div className="bg-emerald-50 text-emerald-600 text-xs font-black px-3 py-1 rounded-full border border-emerald-100">
                    {trend}
                </div>
            )}
        </div>
        <div className="mt-8">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest">{title}</h3>
            <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">
                {value}
            </p>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100/50">
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} w-2/3 rounded-full opacity-60`}></div>
            </div>
        </div>
    </div>
);

export default function DashboardPage() {
    const { stats, recentTransactions, isLoading } = useDashboard();

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">الإحصائيات العامة</h2>
                    <p className="text-slate-500 mt-3 text-lg font-medium">نظرة شاملة على أداء الصناديق والعمليات اليومية</p>
                </div>
                <div className="flex space-x-3 space-x-reverse">
                    <button className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-bold text-gray-700 hover:bg-gray-50 transition-colors">تحميل التقرير</button>
                    <button className="premium-gradient text-white px-8 py-3 rounded-2xl shadow-xl shadow-indigo-500/20 font-bold hover:opacity-90 transition-all">تحميل PDF</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard
                    title="عدد الصناديق"
                    value={stats.cashboxes_count}
                    icon={Wallet}
                    color="bg-indigo-600"
                    trend="+2 هذا الشهر"
                />
                <StatCard
                    title="الرصيد الإجمالي"
                    value={`${stats.total_balance} MRU`}
                    icon={CreditCard}
                    color="bg-emerald-600"
                    trend="مستقر"
                />
                <StatCard
                    title="العمليات اليومية"
                    value={stats.daily_transactions}
                    icon={ArrowUpRight}
                    color="bg-amber-600"
                    trend="+15%"
                />
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/40">
                <div className="p-10 border-b border-gray-100 bg-white/50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">آخر العمليات</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-10 py-5">النوع</th>
                                <th className="px-10 py-5">المبلغ</th>
                                <th className="px-10 py-5">المستخدم</th>
                                <th className="px-10 py-5">الحالة</th>
                                <th className="px-10 py-5">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentTransactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center">
                                            <div className={`p-2.5 rounded-xl ml-4 ${t.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {t.type === 'deposit' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                            </div>
                                            <span className="font-bold text-slate-700">{t.type === 'deposit' ? 'إيداع' : 'سحب'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 font-black text-slate-900">{t.amount} MRU</td>
                                    <td className="px-10 py-6 text-slate-600 font-medium">{t.user?.name}</td>
                                    <td className="px-10 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${t.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : t.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {t.status === 'approved' ? 'مقبول' : t.status === 'rejected' ? 'مرفوض' : 'معلق'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-slate-400 font-medium text-sm">{new Date(t.created_at).toLocaleDateString('ar-MA')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
