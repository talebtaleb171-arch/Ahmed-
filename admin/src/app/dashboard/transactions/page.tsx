'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Check, X, Eye, Image as ImageIcon, Plus, Edit2, Trash2, Calendar, Search, Filter, Download, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // CRUD States
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [cashBoxes, setCashBoxes] = useState<any[]>([]);
    const [withdrawalTypes, setWithdrawalTypes] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        cashbox_id: '',
        type: 'deposit',
        amount: '',
        withdrawal_type_id: '',
        account_number: '',
        phone_number: '',
        notes: ''
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (fromDate) params.append('from_date', fromDate);
            if (toDate) params.append('to_date', toDate);

            const res = await api.get(`/transactions?${params.toString()}`);
            setTransactions(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDependencies = async () => {
        try {
            const [boxesRes, typesRes] = await Promise.all([
                api.get('/cashboxes'),
                api.get('/withdrawal-types')
            ]);
            setCashBoxes(boxesRes.data);
            setWithdrawalTypes(typesRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchDependencies();
    }, [status, fromDate, toDate]);

    const handleApprove = async (id: number) => {
        if (!confirm('هل أنت متأكد من الموافقة على هذه العملية؟')) return;
        try {
            await api.post(`/transactions/${id}/approve`);
            fetchTransactions();
        } catch (err) {
            alert('فشل الاعتماد');
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('سبب الرفض:');
        if (!reason) return;
        try {
            await api.post(`/transactions/${id}/reject`, { reason });
            fetchTransactions();
        } catch (err) {
            alert('فشل الرفض');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذه العملية (حذف ناعم)؟')) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch (err: any) {
            alert(err.response?.data?.message || 'فشل الحذف');
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (fromDate) params.append('from_date', fromDate);
            if (toDate) params.append('to_date', toDate);
            params.append('no_paginate', '1');

            const res = await api.get(`/transactions?${params.toString()}`);
            const dataToExport = res.data.data.map((t: any) => ({
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
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
            XLSX.writeFile(workbook, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (err) {
            console.error('Export failed', err);
            alert('فشل تصدير البيانات');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode && selectedTransaction) {
                await api.put(`/transactions/${selectedTransaction.id}`, formData);
            } else {
                await api.post('/transactions', formData);
            }
            setShowModal(false);
            setFormData({ cashbox_id: '', type: 'deposit', amount: '', withdrawal_type_id: '', account_number: '', phone_number: '', notes: '' });
            fetchTransactions();
        } catch (err: any) {
            alert(err.response?.data?.message || 'فشل حفظ العملية');
        }
    };

    const openEdit = (t: any) => {
        setSelectedTransaction(t);
        setFormData({
            cashbox_id: t.cashbox_id.toString(),
            type: t.type,
            amount: t.amount.toString(),
            withdrawal_type_id: t.withdrawal_type_id?.toString() || '',
            account_number: t.account_number || '',
            phone_number: t.phone_number || '',
            notes: t.notes || ''
        });
        setEditMode(true);
        setShowModal(true);
    };

    return (
        <div className="space-y-12">
            {/* Header & Filters */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">سجل العمليات</h2>
                    <p className="text-slate-500 text-lg font-medium">متابعة دقيقة لكافة الحركات المالية وتاريخ المحفظة</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100/50">
                    <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100 group focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                        <Calendar className="h-5 w-5 text-slate-400 ml-3 group-focus-within:text-indigo-500 transition-colors" />
                        <div className="flex items-center text-sm font-bold text-slate-700">
                            <input
                                type="date"
                                className="bg-transparent outline-none cursor-pointer"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                            <span className="mx-4 text-slate-300 font-black">/</span>
                            <input
                                type="date"
                                className="bg-transparent outline-none cursor-pointer"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-2xl px-8 py-3.5 text-sm font-black text-slate-700 outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all pr-12"
                        >
                            <option value="">كل العمليات</option>
                            <option value="pending">بانتظار المراجعة</option>
                            <option value="approved">تم قبولها</option>
                            <option value="rejected">مرفوضة</option>
                        </select>
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {(fromDate || toDate || status !== 'pending') && (
                        <button
                            onClick={() => { setFromDate(''); setToDate(''); setStatus('pending'); }}
                            className="text-red-500 hover:text-red-600 p-3.5 bg-red-50 rounded-2xl border border-red-100 transition-all hover:scale-110 active:scale-95 shadow-sm"
                            title="تفريغ البحث"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}

                    <div className="h-10 w-[2px] bg-slate-100 mx-2 hidden xl:block"></div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExport}
                            className="bg-emerald-50 text-emerald-600 px-8 py-3.5 rounded-2xl flex items-center hover:bg-emerald-100 transition-all border border-emerald-100 font-black text-sm uppercase tracking-wider"
                        >
                            <Download className="ml-2.5 h-5 w-5" />
                            تصدير Excel
                        </button>

                        <button
                            onClick={() => { setEditMode(false); setShowModal(true); }}
                            className="premium-gradient text-white px-8 py-3.5 rounded-2xl flex items-center shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 transition-all font-black text-sm"
                        >
                            <Plus className="ml-2.5 h-5 w-5 font-black" />
                            إضافة عملية يدوية
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 shadow-slate-200/60">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-right">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">المعرف</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">نوع العملة / الحساب</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">الوكيل المسؤول</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">نوع الحركة</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">المبلغ</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">توقيت العملية</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">الوضعية</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">المرفقات</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4"></div>
                                            <span className="text-slate-400 font-bold tracking-wide">جاري مزامنة السجلات...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-slate-50 p-6 rounded-full mb-4">
                                                <Search className="h-10 w-10 text-slate-200" />
                                            </div>
                                            <span className="text-slate-400 font-black text-lg">لم يتم العثور على أي بيانات</span>
                                            <p className="text-slate-300 text-sm mt-1">جرب تغيير معايير البحث أو الفلترة</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="text-xs font-black text-slate-400 font-mono tracking-tighter">TRX-{t.id}</span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 tracking-tight">{t.cash_box?.name || 'غير معروف'}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.withdrawal_type?.name || 'حركة داخلية'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs ml-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {(t.creator?.name || 'A')[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">{t.creator?.name || 'آلي'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${t.type === 'deposit'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ml-2 ${t.type === 'deposit' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                {t.type === 'deposit' ? 'إيداع مالي' : 'سحب خارجي'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-center">
                                            <span className="text-xl font-black text-slate-900 tracking-tighter">{t.amount} <span className="text-xs text-slate-400 font-bold ml-1 uppercase">mru</span></span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col text-right">
                                                <span className="text-sm font-black text-slate-700">{new Date(t.created_at).toLocaleDateString('ar-MA')}</span>
                                                <span className="text-[10px] font-bold text-slate-400 tracking-widest">{new Date(t.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-center">
                                            <span className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm border ${t.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                t.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {t.status === 'approved' ? 'معتمد' : t.status === 'rejected' ? 'ملغي' : 'قيد التدقيق'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-center">
                                            {t.media?.length > 0 ? (
                                                <button
                                                    onClick={() => setSelectedImage(t.media[0].image_url)}
                                                    className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all transform hover:rotate-12 border border-indigo-100"
                                                >
                                                    <ImageIcon className="h-5 w-5" />
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">بدون صور</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-left">
                                            <div className="flex items-center space-x-3 space-x-reverse justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                {t.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(t.id)}
                                                            className="bg-white text-emerald-600 p-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                            title="قبول"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(t.id)}
                                                            className="bg-white text-red-600 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                                            title="رفض"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEdit(t)}
                                                            className="bg-white text-indigo-600 p-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                            title="تعديل"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="bg-white text-slate-400 p-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-slate-100"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-white/20">
                        <div className="premium-gradient px-10 py-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-2xl font-black tracking-tight relative z-10">
                                {editMode ? 'تعديل بيانات العملية' : 'إضافة عملية مالية'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors relative z-10 border border-white/20">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {!editMode && (
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">مصدر / وجهة الصندوق</label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer font-bold text-slate-900"
                                        value={formData.cashbox_id}
                                        onChange={(e) => setFormData({ ...formData, cashbox_id: e.target.value })}
                                    >
                                        <option value="">اختر الصندوق...</option>
                                        {cashBoxes.map(box => (
                                            <option key={box.id} value={box.id}>{box.name} ({box.balance} MRU)</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {!editMode && (
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">تصنيف الحركة المالية</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'deposit' })}
                                            className={`py-5 rounded-2xl font-black transition-all flex flex-col items-center border-2 ${formData.type === 'deposit'
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/10'
                                                : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                                }`}
                                        >
                                            <ArrowUpCircle className={`mb-2 h-6 w-6 ${formData.type === 'deposit' ? 'text-emerald-500' : 'text-slate-300'}`} />
                                            إيداع مالي
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'withdrawal' })}
                                            className={`py-5 rounded-2xl font-black transition-all flex flex-col items-center border-2 ${formData.type === 'withdrawal'
                                                ? 'bg-red-50 border-red-500 text-red-600 shadow-lg shadow-red-500/10'
                                                : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                                }`}
                                        >
                                            <ArrowDownCircle className={`mb-2 h-6 w-6 ${formData.type === 'withdrawal' ? 'text-red-500' : 'text-slate-300'}`} />
                                            سحب خارجي
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">القيمة النقدية (MRU)</label>
                                <input
                                    type="number" required step="0.01"
                                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-4xl font-black text-slate-900 transition-all"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            {formData.type === 'withdrawal' && (
                                <div className="space-y-6 pt-6 border-t border-slate-100 mt-6 bg-slate-50/50 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">طريقة السحب</label>
                                        <select
                                            className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none font-bold"
                                            value={formData.withdrawal_type_id}
                                            onChange={(e) => setFormData({ ...formData, withdrawal_type_id: e.target.value })}
                                            required
                                        >
                                            <option value="">اختر النوع المميز...</option>
                                            {withdrawalTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">رقم الحساب</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-right text-sm font-bold"
                                                value={formData.account_number}
                                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">رقم الهاتف</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-right text-sm font-bold"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">ملاحظات إضافية (اختياري)</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 h-28 font-medium transition-all"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="اكتب أي تفاصيل إضافية هنا..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full premium-gradient text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 transition-all text-xl tracking-tight"
                            >
                                {editMode ? 'حفظ التعديلات النهائية' : 'اعتـماد العملـية الآن'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4" onClick={() => setSelectedImage(null)}>
                    <div className="max-w-4xl max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage} alt="Large" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                        <button
                            className="absolute -top-4 -right-4 bg-white text-red-600 rounded-full p-2 shadow-xl hover:bg-gray-100 transition-transform hover:scale-110"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
