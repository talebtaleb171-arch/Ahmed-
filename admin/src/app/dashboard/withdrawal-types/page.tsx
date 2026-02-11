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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">إدارة أنواع السحوبات</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                >
                    <Plus className="ml-2 h-5 w-5" />
                    إضافة نوع جديد
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-6 py-4">الاسم</th>
                            <th className="px-6 py-4 text-center">الحالة</th>
                            <th className="px-6 py-4 text-left">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-8">جاري التحميل...</td></tr>
                        ) : types.length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-8 text-gray-500">لا توجد أنواع سحوبات حالياً</td></tr>
                        ) : types.map((type) => (
                            <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    {editingId === type.id ? (
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button onClick={() => handleRename(type.id)} className="text-green-600 hover:text-green-700">
                                                <Save className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-500">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="font-medium text-gray-900">{type.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleUpdate(type.id, !type.is_active)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${type.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {type.is_active ? 'نشط' : 'معطل'}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-start space-x-3 space-x-reverse">
                                        <button
                                            onClick={() => { setEditingId(type.id); setEditName(type.name); }}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="تعديل"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(type.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="حذف"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">إضافة نوع سحب جديد</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-white opacity-80 hover:opacity-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                    اسم النوع
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-right"
                                    placeholder="مثال: كاش، شيك، دين..."
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                            >
                                حفظ النوع
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
