'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [boxesRes, transRes] = await Promise.all([
                    api.get('/cashboxes'),
                    api.get('/transactions')
                ]);

                const boxes = boxesRes.data;
                const mainBox = boxes.find((b: any) => b.type === 'main');
                const transactions = transRes.data.data;

                setStats({
                    mainBalance: mainBox?.balance || 0,
                    subBoxesCount: boxes.length - 1,
                    pendingTransactions: transactions.filter((t: any) => t.status === 'pending').length,
                    totalSubBalance: boxes.filter((b: any) => b.type === 'sub').reduce((acc: number, b: any) => acc + parseFloat(b.balance), 0),
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>جاري التحميل...</div>;

    const cards = [
        { name: 'رصيد الصندوق الرئيسي', value: `${stats.mainBalance} د.ج`, icon: Wallet, color: 'bg-blue-500' },
        { name: 'إجمالي أرصدة الوكلاء', value: `${stats.totalSubBalance} د.ج`, icon: ArrowUpCircle, color: 'bg-green-500' },
        { name: 'عدد الصناديق الفرعية', value: stats.subBoxesCount, icon: Clock, color: 'bg-purple-500' },
        { name: 'عمليات بانتظار الموافقة', value: stats.pendingTransactions, icon: Clock, color: 'bg-yellow-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.name} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-transparent hover:border-l-blue-500 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.name}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                            </div>
                            <div className={`${card.color} p-3 rounded-lg text-white`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold mb-4">أداء الصناديق الفرعية</h2>
                <div className="h-64 bg-gray-50 flex items-center justify-center text-gray-400">
                    [هنا رسم بياني يوضح تطور الأرصدة]
                </div>
            </div>
        </div>
    );
}
