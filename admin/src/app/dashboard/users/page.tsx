'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, UserPlus, Trash2, Mail, Phone, Shield, X } from 'lucide-react';

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-6 shadow-xl shadow-indigo-500/10"></div>
            <span className="text-slate-400 font-black text-xl tracking-widest uppercase">جاري استيراد بيانات الوكلاء...</span>
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">إدارة الوكلاء</h2>
                    <p className="text-slate-500 mt-3 text-lg font-medium">إضافة وتفويض الوكلاء لإدارة الصناديق والعمليات</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="premium-gradient text-white px-10 py-4 rounded-[2rem] shadow-2xl shadow-indigo-500/20 font-black flex items-center hover:-translate-y-1 active:scale-95 transition-all text-sm tracking-wide"
                >
                    <UserPlus className="ml-3 h-5 w-5 font-black" />
                    تـفويـض وكـيل جـديد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {users.map((user) => (
                    <div key={user.id} className="glass-card rounded-[2.5rem] p-10 border-white/40 hover:scale-[1.03] transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>

                        <div className="flex items-center justify-between mb-10 relative">
                            <div className="flex items-center space-x-5 space-x-reverse">
                                <div className="bg-slate-100 p-5 rounded-3xl text-slate-600 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user.name}</h3>
                                    <div className="flex items-center mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">نشط الآن</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="bg-white text-red-100 p-3 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                                title="سحب الصلاحيات"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 pt-8 border-t border-slate-100/60 relative">
                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                                <div className="flex items-center text-slate-600">
                                    <div className="bg-white p-2 rounded-xl border border-slate-200 ml-4 group-hover:border-indigo-100 transition-colors">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">{user.email}</span>
                                </div>
                            </div>

                            {user.phone && (
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                                    <div className="flex items-center text-slate-600">
                                        <div className="bg-white p-2 rounded-xl border border-slate-200 ml-4 group-hover:border-indigo-100 transition-colors">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">{user.phone}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    تاريخ الاعتماد: {new Date(user.created_at).toLocaleDateString('ar-DZ')}
                                </span>
                                <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    وكيل معتمد
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-white/20">
                        <div className="premium-gradient px-10 py-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-2xl font-black tracking-tight relative z-10">تفويض وكيل جديد</h3>
                            <button onClick={() => setShowModal(false)} className="text-white bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors relative z-10 border border-white/20">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">الاسم الكامل للوكيل</label>
                                    <input
                                        type="text" required
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-900 transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="أدخل الاسم الرباعي..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">البريد الإلكتروني المهني</label>
                                    <input
                                        type="email" required
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-900 transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="example@company.com"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">رقم الهاتف الجوال</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-900 transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+222 xxxxxxxx"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">كلمة المرور الحصينة</label>
                                    <input
                                        type="password" required minLength={8}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-900 transition-all"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>
                            <div className="pt-6 flex space-x-4 space-x-reverse">
                                <button
                                    type="submit"
                                    className="flex-[2] premium-gradient text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 transition-all text-lg"
                                >
                                    اعتمـاد الوكـيـل
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-[2rem] font-black hover:bg-slate-200 transition-all text-sm uppercase tracking-widest"
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
