'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Check, X, Eye, Image as ImageIcon, Plus, Edit2, Trash2, Calendar, Search, Filter, Download } from 'lucide-react';
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
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">سجل العمليات</h2>
                        <p className="text-gray-500 text-sm">إدارة ومراقبة كافة العمليات المالية</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                            <input
                                type="date"
                                className="bg-transparent text-sm outline-none"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                            <span className="mx-2 text-gray-300">إلى</span>
                            <input
                                type="date"
                                className="bg-transparent text-sm outline-none"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">كل الحالات</option>
                            <option value="pending">بانتظار الموافقة</option>
                            <option value="approved">مقبول</option>
                            <option value="rejected">مرفوض</option>
                        </select>

                        {(fromDate || toDate || status !== 'pending') && (
                            <button
                                onClick={() => { setFromDate(''); setToDate(''); setStatus('pending'); }}
                                className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                تفريغ
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white px-6 py-2.5 rounded-xl flex items-center hover:bg-green-700 transition-all shadow-lg shadow-green-100 font-bold"
                    >
                        <Download className="ml-2 h-5 w-5" />
                        تنزيل Excel
                    </button>

                    <button
                        onClick={() => { setEditMode(false); setShowModal(true); }}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold"
                    >
                        <Plus className="ml-2 h-5 w-5" />
                        إضافة عملية
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-right">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المعرف</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الصندوق</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الوكيل</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">النوع</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">نوع السحب</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المبلغ</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الحالة</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الصور</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                            <span className="text-gray-500">جاري تحميل العمليات...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <Search className="h-10 w-10 mb-2 opacity-20" />
                                            <span>لا توجد عمليات تطابق معايير البحث</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">#{t.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{t.cash_box?.name || 'غير معروف'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.creator?.name || 'آلي'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`font-bold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.type === 'deposit' ? 'إيداع' : 'سحب'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {t.withdrawal_type?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">{t.amount} MRU</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 text-right dir-rtl">
                                            {t.created_at ? (
                                                <>
                                                    <div className="font-medium text-gray-700">{new Date(t.created_at).toLocaleDateString('ar-MA')}</div>
                                                    <div className="text-[10px] opacity-60">{new Date(t.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${t.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {t.status === 'approved' ? 'مقبول' : t.status === 'rejected' ? 'مرفوض' : 'معلق'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {t.media?.length > 0 && (
                                                <button
                                                    onClick={() => setSelectedImage(t.media[0].image_url)}
                                                    className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <ImageIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <div className="flex items-center space-x-2 space-x-reverse justify-end">
                                                {t.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(t.id)}
                                                            className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-colors"
                                                            title="قبول"
                                                        >
                                                            <Check className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(t.id)}
                                                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="رفض"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEdit(t)}
                                                            className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                                                            title="تعديل"
                                                        >
                                                            <Edit2 className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="bg-gray-50 text-gray-400 p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="h-5 w-5" />
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-blue-900 px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">{editMode ? 'تعديل العملية' : 'إضافة عملية جديدة'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-blue-200 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                            {!editMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الصندوق</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 border rounded-lg text-right outline-none focus:ring-2 focus:ring-blue-500"
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">نوع العملية</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'deposit' })}
                                            className={`py-2 rounded-lg font-bold transition-all ${formData.type === 'deposit' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                            إيداع
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'withdrawal' })}
                                            className={`py-2 rounded-lg font-bold transition-all ${formData.type === 'withdrawal' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                            سحب
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">المبلغ (MRU)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    className="w-full px-4 py-2 border rounded-lg text-right outline-none focus:ring-2 focus:ring-blue-500 text-xl font-bold"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            {formData.type === 'withdrawal' && (
                                <div className="space-y-4 pt-2 border-t border-gray-100 mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">نوع السحب</label>
                                        <select
                                            className="w-full px-4 py-2 border rounded-lg text-right outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.withdrawal_type_id}
                                            onChange={(e) => setFormData({ ...formData, withdrawal_type_id: e.target.value })}
                                            required
                                        >
                                            <option value="">اختر النوع...</option>
                                            {withdrawalTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 text-right text-xs">رقم الحساب</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border rounded-lg text-right text-sm"
                                                value={formData.account_number}
                                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 text-right text-xs">رقم الهاتف</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border rounded-lg text-right text-sm"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">ملاحظات</label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-lg text-right outline-none focus:ring-2 focus:ring-blue-500 h-20"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4 shadow-lg shadow-blue-100"
                            >
                                {editMode ? 'تحديث التعديلات' : 'تأكيد الإضافة'}
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
