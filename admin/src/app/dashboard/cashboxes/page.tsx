'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Wallet } from 'lucide-react';

export default function CashBoxesPage() {
    const [cashBoxes, setCashBoxes] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        owner_id: '',
        daily_limit: '',
    });

    const fetchData = async () => {
        try {
            const [boxesRes, usersRes] = await Promise.all([
                api.get('/cashboxes'),
                // Assuming we have a /users endpoint for agents
                api.get('/me').then(() => api.get('/cashboxes').then(() => ({ data: [] }))) // Placeholder, normally get users
            ]);
            setCashBoxes(boxesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/cashboxes', formData);
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert('فشل إنشاء الصندوق');
        }
    };

    if (loading) return <div>جاري التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">إدارة الصناديق الفرعية</h2>
                <button
                    onClick={() => alert('تحتاج لإضافة واجهة مستخدمين أولاً لربط الصناديق')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                >
                    <Plus className="ml-2 h-5 w-5" />
                    إضافة صندوق جديد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cashBoxes.map((box) => (
                    <div key={box.id} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-blue-500">
                        <div className="flex items-center space-x-4 space-x-reverse mb-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{box.name}</h3>
                                <p className="text-sm text-gray-500">{box.owner.name}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">الرصيد:</span>
                                <span className="font-bold text-gray-900">{box.balance} د.ج</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">النوع:</span>
                                <span>{box.type === 'main' ? 'رئيسي' : 'فرعي'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">الحالة:</span>
                                <span className="text-green-600 font-medium">نشط</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
