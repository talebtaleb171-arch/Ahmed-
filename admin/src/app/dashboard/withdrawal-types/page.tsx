'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, X, Check, Save } from 'lucide-react';

interface WithdrawalType {
    id: number;
    name: string;
    is_active: boolean;
}

export default function WithdrawalTypesPage() {
    const [types, setTypes] = useState<WithdrawalType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/withdrawal-types');
            setTypes(response.data);
        } catch (error) {
            console.error('Error fetching types:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/withdrawal-types', { name: newName });
            setNewName('');
            setShowAddModal(false);
            fetchTypes();
        } catch (error) {
            console.error('Error adding type:', error);
        }
    };

    const handleUpdate = async (id: number, active: boolean) => {
        try {
            await api.put(`/withdrawal-types/${id}`, { is_active: active });
            fetchTypes();
        } catch (error) {
            console.error('Error updating type:', error);
        }
    };

    const handleRename = async (id: number) => {
        try {
            await api.put(`/withdrawal-types/${id}`, { name: editName });
            setEditingId(null);
            fetchTypes();
        } catch (error) {
            console.error('Error renaming type:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;
        try {
            await api.delete(`/withdrawal-types/${id}`);
            fetchTypes();
        } catch (error) {
            console.error('Error deleting type:', error);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">أنواع السحوبات</h2>
                    <p className="text-slate-500 mt-3 text-lg font-medium">إدارة وتصنيف طرق السحب المتاحة للوكلاء</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="premium-gradient text-white px-10 py-4 rounded-[2rem] shadow-2xl shadow-indigo-500/20 font-black flex items-center hover:-translate-y-1 active:scale-95 transition-all text-sm tracking-wide"
                >
                    <Plus className="ml-3 h-5 w-5 font-black" />
                    إضافة تصنيف جديد
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 shadow-slate-200/60">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">اسم التصنيف</th>
                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">حالة التفعيل</th>
                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-left">الإجراءات والتحكم</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4"></div>
                                        <span className="text-slate-400 font-bold tracking-wide">جاري مزامنة التصنيفات...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : types.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-slate-50 p-6 rounded-full mb-4">
                                            <Plus className="h-10 w-10 text-slate-200" />
                                        </div>
                                        <span className="text-slate-400 font-black text-lg">لا توجد تصنيفات معرفة بعد</span>
                                        <p className="text-slate-300 text-sm mt-1">ابدأ بإضافة أول نوع سحب للمنظومة</p>
                                    </div>
                                </td>
                            </tr>
                        ) : types.map((type) => (
                            <tr key={type.id} className="hover:bg-slate-50/80 transition-all group">
                                <td className="px-8 py-6 whitespace-nowrap">
                                    {editingId === type.id ? (
                                        <div className="flex items-center space-x-3 space-x-reverse animate-in fade-in slide-in-from-right-2 duration-300">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="bg-white border-2 border-indigo-500 rounded-xl px-4 py-2 text-sm font-black text-slate-900 outline-none shadow-lg shadow-indigo-500/10 w-64 transition-all"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleRename(type.id)}
                                                className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                                                title="حفظ التغييرات"
                                            >
                                                <Save className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="bg-slate-100 text-slate-400 p-2 rounded-xl hover:bg-slate-200 transition-all"
                                                title="إلغاء المعاينة"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-4 space-x-reverse">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                <span className="text-xs font-black">{type.name[0].toUpperCase()}</span>
                                            </div>
                                            <span className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{type.name}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => handleUpdate(type.id, !type.is_active)}
                                        className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${type.is_active
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                            : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center">
                                            <div className={`w-1.5 h-1.5 rounded-full ml-2 ${type.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            {type.is_active ? 'نشط ومفعل' : 'معطل مؤقتاً'}
                                        </div>
                                    </button>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-left">
                                    <div className="flex items-center space-x-3 space-x-reverse justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                        <button
                                            onClick={() => { setEditingId(type.id); setEditName(type.name); }}
                                            className="bg-white text-indigo-600 p-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-50"
                                            title="إعادة التسمية"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(type.id)}
                                            className="bg-white text-slate-400 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-slate-50"
                                            title="حذف التصنيف"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-white/20">
                        <div className="premium-gradient px-10 py-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-2xl font-black tracking-tight relative z-10">إضافة تصنيف سحب جديد</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-white bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors relative z-10 border border-white/20">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                                    اسم نوع السحب المقترح
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-2xl font-black text-slate-900 transition-all"
                                    placeholder="مثال: كاش يمين، بنكيلي، موريبوست..."
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right mr-4">يظهر هذا الاسم للوكلاء عند إجراء عمليات السحب الخارجي</p>
                            </div>

                            <div className="pt-6 flex space-x-4 space-x-reverse">
                                <button
                                    type="submit"
                                    className="flex-[2] premium-gradient text-white py-6 rounded-[2rem] font-black shadow-2xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 transition-all text-xl tracking-tight"
                                >
                                    حفظ وتفعيل التصنيف
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[2rem] font-black hover:bg-slate-200 transition-all text-sm uppercase tracking-widest"
                                >
                                    تراجع
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
