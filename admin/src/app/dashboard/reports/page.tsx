'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Download, Calendar, Filter, FileText, Check, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
    const [status, setStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/transactions/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const handleExport = async (format: 'xlsx' | 'csv') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (fromDate) params.append('from_date', fromDate);
            if (toDate) params.append('to_date', toDate);
            params.append('no_paginate', '1');

            const res = await api.get(`/transactions?${params.toString()}`);
            const data = res.data.data;

            if (format === 'xlsx') {
                const dataToExport = data.map((t: any) => ({
                    'المعرف': t.id,
                    'الصندوق': t.cash_box?.name || 'غير معروف',
                    'الوكيل': t.creator?.name || 'آلي',
                    'النوع': t.type === 'deposit' ? 'إيداع' : 'سحب',
                    'نوع السحب': t.withdrawal_type?.name || '-',
                    'المبلغ': t.amount,
                    'التاريخ': new Date(t.created_at).toLocaleString('ar-MA'),
                    'الحالة': t.status === 'approved' ? 'مقبول' : t.status === 'rejected' ? 'مرفوض' : 'معلق'
                }));

                const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'العمليات');
                XLSX.writeFile(workbook, `report_${new Date().toISOString().split('T')[0]}.xlsx`);
            } else {
                // Background already has CSV export at /export-transactions, but we can also do it here for consistency
                const blob = new Blob([res.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
            }
        } catch (err) {
            console.error(err);
            alert('فشل تصدير البيانات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">مركز التقارير</h2>
                    <p className="text-slate-500 mt-3 text-lg font-medium">تحليل البيانات واستخراج سجلات العمليات بصيغ احترافية</p>
                </div>
            </div>

            <div className="glass-card p-12 rounded-[3rem] border-white/40 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-500/10 transition-colors"></div>

                <div className="flex items-center space-x-6 space-x-reverse mb-12 relative z-10">
                    <div className="bg-slate-100 p-5 rounded-[1.5rem] text-slate-600 border border-slate-200 shadow-inner group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500">
                        <FileText className="h-10 w-10" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">فلترة التقارير الذكية</h3>
                        <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">تخصيص معايير البحث للحصول على نتائج دقيقة</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-right">وضعية العمليات</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-3.5 outline-none font-black text-slate-700 shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="">كل العمليات</option>
                            <option value="pending">بانتظار المراجعة</option>
                            <option value="approved">تم قبولها</option>
                            <option value="rejected">مرفوضة نهائياً</option>
                        </select>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-right">بداية الفترة الزمنية</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-3.5 outline-none font-black text-slate-700 shadow-sm cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-right">نهاية الفترة الزمنية</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-3.5 outline-none font-black text-slate-700 shadow-sm cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-16 border-4 border-dashed border-indigo-100 rounded-[3rem] bg-indigo-50/30 group/inner transition-all hover:bg-indigo-50/50 hover:border-indigo-200 relative z-10">
                    <div className="text-center mb-10">
                        <p className="text-xl font-black text-slate-800 mb-3 tracking-tight">محرك التقارير جاهز للعمل</p>
                        <div className="flex items-center justify-center space-x-3 space-x-reverse">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-400 tracking-wide">
                                {stats ? `تم العثور على ${stats.total} سجل مطابق حالياً` : 'جاري فحص السجلات المتاحة...'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleExport('xlsx')}
                        disabled={loading}
                        className={`group relative flex items-center px-12 py-5 premium-gradient text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {loading ? (
                            <div className="w-6 h-6 rounded-full border-4 border-white/20 border-t-white animate-spin ml-4"></div>
                        ) : (
                            <Download className="ml-4 h-7 w-7 transform group-hover:rotate-12 transition-transform" />
                        )}
                        تصدير التقرير بصيغة EXCEL
                    </button>

                    <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Data Analysis System Module v2.0</p>
                </div>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: 'العمليات المقبولة', value: stats?.approved || 0, color: 'emerald', icon: Check },
                    { label: 'العمليات المعلقة', value: stats?.pending || 0, color: 'amber', icon: Calendar },
                    { label: 'العمليات المرفوضة', value: stats?.rejected || 0, color: 'red', icon: Filter },
                    { label: 'إجمالي العمليات', value: stats?.total || 0, color: 'indigo', icon: FileText }
                ].map((stat, idx) => (
                    <div key={idx} className="glass-card p-10 rounded-[2.5rem] border-white/40 hover:scale-[1.05] transition-all duration-300 shadow-xl shadow-slate-200/50">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-6 border border-${stat.color}-100`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</div>
                        <div className={`text-4xl font-black text-slate-900 tracking-tighter`}>{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
