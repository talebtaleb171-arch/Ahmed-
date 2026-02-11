'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Download, Calendar, Filter, FileText } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 space-x-reverse mb-8">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                        <FileText className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">مركز التقارير</h2>
                        <p className="text-gray-500">قم بتوليد وتحميل تقارير العمليات بصيغة Excel</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <label className="block text-sm font-medium text-gray-600 mb-2 text-right">الحالة</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">كل الحالات</option>
                            <option value="pending">معلق</option>
                            <option value="approved">مقبول</option>
                            <option value="rejected">مرفوض</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <label className="block text-sm font-medium text-gray-600 mb-2 text-right">من تاريخ</label>
                        <div className="relative">
                            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg pr-10 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <label className="block text-sm font-medium text-gray-600 mb-2 text-right">إلى تاريخ</label>
                        <div className="relative">
                            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg pr-10 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-2">جاهز لتوليد التقرير بناءً على الفلاتر المختارة</p>
                        {stats && (
                            <p className="text-sm text-gray-400">إجمالي العمليات المتاحة: {stats.total}</p>
                        )}
                    </div>

                    <button
                        onClick={() => handleExport('xlsx')}
                        disabled={loading}
                        className={`flex items-center px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
                        ) : (
                            <Download className="ml-3 h-6 w-6" />
                        )}
                        تحميل تقرير Excel (.xlsx)
                    </button>

                    <p className="mt-4 text-xs text-gray-400">سيتم تجميع كافة البيانات التي تطابق البحث في ملف واحد</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">العمليات المقبولة</div>
                    <div className="text-2xl font-bold text-green-600">{stats?.approved || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">العمليات المعلقة</div>
                    <div className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">العمليات المرفوضة</div>
                    <div className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">الإجمالي</div>
                    <div className="text-2xl font-bold text-blue-600">{stats?.total || 0}</div>
                </div>
            </div>
        </div>
    );
}
