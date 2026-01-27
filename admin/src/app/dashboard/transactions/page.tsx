'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Check, X, Eye, Image as ImageIcon } from 'lucide-react';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

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

    if (loading) return <div>جاري التحميل...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-right">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-900">المعرف</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-900">الصندوق</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-900">الوكيل</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-900">النوع</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-900">المبلغ</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-900">الحالة</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-900">الصور</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-900">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.cash_box.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.creator.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {t.type === 'deposit' ? 'إيداع' : 'سحب'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{t.amount} د.ج</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${t.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        t.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {t.status === 'approved' ? 'مقبول' : t.status === 'rejected' ? 'مرفوض' : 'معلق'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {t.media?.length > 0 && (
                                    <button onClick={() => setSelectedImage(t.media[0].image_url)} className="text-blue-600 hover:text-blue-900">
                                        <ImageIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {t.status === 'pending' && (
                                    <div className="flex space-x-2 space-x-reverse">
                                        <button onClick={() => handleApprove(t.id)} className="text-green-600 hover:text-green-900">
                                            <Check className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleReject(t.id)} className="text-red-600 hover:text-red-900">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="max-w-4xl w-full bg-white p-2 rounded-lg relative">
                        <img src={selectedImage} alt="Proof" className="w-full h-auto max-h-[80vh] object-contain" />
                        <button className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg" onClick={() => setSelectedImage(null)}>
                            <X className="h-6 w-6 text-gray-800" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
