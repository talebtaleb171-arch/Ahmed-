'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, UserPlus, Trash2, Mail, Phone, Shield } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', phone: '' });
            fetchUsers();
        } catch (err) {
            alert('فشل إضافة المستخدم');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الوكيل؟')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('فشل الحذف');
        }
    };

    if (loading) return <div>جاري التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">إدارة الوكلاء</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                >
                    <UserPlus className="ml-2 h-5 w-5" />
                    إضافة وكيل جديد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user.id} className="bg-white rounded-xl shadow-md p-6 border-r-4 border-r-blue-500 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                            </div>
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center text-gray-600">
                                <Mail className="ml-2 h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center text-gray-600">
                                    <Phone className="ml-2 h-4 w-4" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                                <span className="text-xs text-gray-400">تاريخ الانضمام: {new Date(user.created_at).toLocaleDateString('ar-DZ')}</span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">نشط</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-900 px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">إضافة وكيل جديد</h3>
                            <button onClick={() => setShowModal(false)} className="text-blue-200 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الاسم الكامل</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">رقم الهاتف (اختياري)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">كلمة المرور</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex space-x-3 space-x-reverse">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                >
                                    حفظ البيانات
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
