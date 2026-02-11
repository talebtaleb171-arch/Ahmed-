'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Wallet, Shield, X, ArrowUpCircle, ArrowDownCircle, Camera } from 'lucide-react';

export default function CashBoxesPage() {
    const [cashBoxes, setCashBoxes] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);
    const [selectedBox, setSelectedBox] = useState<any>(null);
    const [fundType, setFundType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [withdrawalTypes, setWithdrawalTypes] = useState<any[]>([]);
    const [detailedFund, setDetailedFund] = useState({
        withdrawal_type_id: '',
        account_number: '',
        phone_number: '',
        notes: ''
    });
    const [fundImages, setFundImages] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        owner_id: '',
        daily_limit: '5000',
    });

    const [fundAmount, setFundAmount] = useState('');

    const fetchData = async () => {
        try {
            const [boxesRes, agentsRes, typesRes] = await Promise.all([
                api.get('/cashboxes'),
                api.get('/users'),
                api.get('/withdrawal-types')
            ]);
            setCashBoxes(boxesRes.data);
            setAgents(agentsRes.data);
            setWithdrawalTypes(typesRes.data);
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
            await api.post('/cashboxes', {
                ...formData,
                daily_limit: parseFloat(formData.daily_limit),
                type: 'sub'
            });
            setShowModal(false);
            setFormData({ name: '', owner_id: '', daily_limit: '5000' });
            fetchData();
        } catch (err) {
            alert('فشل إنشاء الصندوق');
        }
    };

    const handleFund = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBox) return;

        const formDataToSend = new FormData();
        formDataToSend.append('amount', fundAmount);
        formDataToSend.append('type', fundType);
        Object.entries(detailedFund).forEach(([key, value]) => {
            if (value) formDataToSend.append(key, value);
        });
        fundImages.forEach((image) => {
            formDataToSend.append('images[]', image);
        });

        try {
            await api.post(`/cashboxes/${selectedBox.id}/fund`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowFundModal(false);
            setFundAmount('');
            setFundImages([]);
            setDetailedFund({
                withdrawal_type_id: '',
                account_number: '',
                phone_number: '',
                notes: ''
            });
            setSelectedBox(null);
            fetchData();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'فشل تنفيذ العملية';
            const technical = err.response?.data?.debug ? `\n\nTechnical details:\n${JSON.stringify(err.response.data.debug, null, 2)}` : '';
            alert(`${msg}${technical}`);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;

    const mainBox = cashBoxes.find(b => b.type === 'main');
    const subBoxes = cashBoxes.filter(b => b.type !== 'main');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">إدارة الصناديق</h2>
                <div className="flex space-x-3 space-x-reverse">
                    {mainBox && (
                        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center">
                            <span className="text-sm text-blue-800 ml-2">رصيد الرئيسي:</span>
                            <span className="font-bold text-blue-900">{mainBox.balance} MRU</span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="ml-2 h-5 w-5" />
                        إضافة صندوق جديد
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Main Box Card */}
                {mainBox && (
                    <div key={mainBox.id} className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg p-6 text-white relative group">
                        <div className="absolute top-4 left-4 flex space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setSelectedBox(mainBox); setFundType('deposit'); setShowFundModal(true); }}
                                className="bg-green-500/20 text-green-300 p-2 rounded-lg hover:bg-green-500/40"
                                title="تعبئة (إيداع)"
                            >
                                <ArrowUpCircle className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => { setSelectedBox(mainBox); setFundType('withdrawal'); setShowFundModal(true); }}
                                className="bg-red-500/20 text-red-300 p-2 rounded-lg hover:bg-red-500/40"
                                title="سحب خارجي"
                            >
                                <ArrowDownCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <div className="bg-blue-700/50 p-3 rounded-full">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{mainBox.name}</h3>
                                    <p className="text-xs text-blue-300">الصندوق الرئيسي للمسؤول</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 pt-6 border-t border-blue-700/50">
                            <div className="flex justify-between items-center">
                                <span className="text-sm opacity-80">الرصيد الكلي:</span>
                                <span className="text-2xl font-black">{mainBox.balance} MRU</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-80">
                                <span>الحالة:</span>
                                <span className="text-green-400">نشط</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub Boxes Cards */}
                {subBoxes.map((box) => (
                    <div key={box.id} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-blue-500 hover:shadow-lg transition-all relative group">
                        <div className="absolute top-4 left-4 flex space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setSelectedBox(box); setFundType('deposit'); setShowFundModal(true); }}
                                className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100"
                                title="شحن رصيد"
                            >
                                <ArrowUpCircle className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => { setSelectedBox(box); setFundType('withdrawal'); setShowFundModal(true); }}
                                className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
                                title="سحب الرصيد للمركزي"
                            >
                                <ArrowDownCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse mb-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{box.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Shield className="ml-1 h-3 w-3" />
                                    {box.owner?.name || 'غير معروف'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2 border-t border-gray-50">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">الرصيد الحالي:</span>
                                <span className="font-bold text-gray-900">{box.balance} MRU</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">الحد اليومي:</span>
                                <span className="text-gray-700">{box.daily_limit} MRU</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fund/Withdraw Modal */}
            {showFundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`${fundType === 'deposit' ? 'bg-green-600' : 'bg-red-600'} px-6 py-4 text-white flex justify-between items-center`}>
                            <h3 className="text-lg font-bold">
                                {selectedBox?.type === 'main'
                                    ? (fundType === 'deposit' ? 'تعبئة الصندوق الرئيسي' : 'سحب من الصندوق الرئيسي')
                                    : (fundType === 'deposit' ? 'شحن رصيد الصندوق' : 'سحب الرصيد للصندوق الرئيسي')}
                            </h3>
                            <button onClick={() => setShowFundModal(false)} className="text-white opacity-80 hover:opacity-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleFund} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">
                                    {selectedBox?.type === 'main'
                                        ? (fundType === 'deposit' ? 'إيداع رصيد خارجي إلى:' : 'سحب رصيد خارجي من:')
                                        : (fundType === 'deposit' ? 'أنت على وشك تحويل رصيد إلى:' : 'أنت على وشك سحب الرصيد من:')}
                                </p>
                                <p className="font-bold text-gray-900">{selectedBox?.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                    المبلغ المراد {fundType === 'deposit' ? 'إضافته' : (selectedBox?.type === 'main' ? 'سحبه' : 'إعادته')} (MRU)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`w-full px-4 py-2 border rounded-lg text-right focus:ring-2 ${fundType === 'deposit' ? 'focus:ring-green-500' : 'focus:ring-red-500'} outline-none text-xl font-bold`}
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                />
                            </div>

                            {fundType === 'withdrawal' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">نوع السحب</label>
                                        <select
                                            className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer"
                                            value={detailedFund.withdrawal_type_id}
                                            onChange={(e) => setDetailedFund({ ...detailedFund, withdrawal_type_id: e.target.value })}
                                            required
                                        >
                                            <option value="">اختر نوع السحب...</option>
                                            {withdrawalTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">رقم الحساب (اختياري)</label>
                                        <input
                                            type="text"
                                            placeholder="رقم الحساب..."
                                            className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-red-500 outline-none"
                                            value={detailedFund.account_number}
                                            onChange={(e) => setDetailedFund({ ...detailedFund, account_number: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">رقم الهاتف (اختياري)</label>
                                        <input
                                            type="text"
                                            placeholder="رقم الهاتف..."
                                            className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-red-500 outline-none"
                                            value={detailedFund.phone_number}
                                            onChange={(e) => setDetailedFund({ ...detailedFund, phone_number: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">ملاحظات (اختياري)</label>
                                        <textarea
                                            placeholder="ملاحظات إضافية..."
                                            className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-red-500 outline-none h-20"
                                            value={detailedFund.notes}
                                            onChange={(e) => setDetailedFund({ ...detailedFund, notes: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">إرفاق صور (إثبات)</label>
                                        <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-500 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        setFundImages(Array.from(e.target.files));
                                                    }
                                                }}
                                            />
                                            <div className="text-center">
                                                <Camera className="mx-auto h-8 w-8 text-gray-400" />
                                                <span className="mt-2 block text-sm font-medium text-gray-600">
                                                    {fundImages.length > 0 ? `تم اختيار ${fundImages.length} صور` : 'اضغط لاختيار الصور'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                className={`w-full ${fundType === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white py-3 rounded-lg font-bold transition-colors shadow-md mt-4`}
                            >
                                تأكيد العملية
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Box Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-blue-900 px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">إنشاء صندوق جديد</h3>
                            <button onClick={() => setShowModal(false)} className="text-blue-200 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">اسم الصندوق</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="مثلاً: صندوق وكالة تفرغ زينة"
                                    className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">صاحب الصندوق (الوكيل)</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    value={formData.owner_id}
                                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                                >
                                    <option value="">اختر وكيلاً...</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name} ({agent.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الحد اليومي المسموح به (MRU)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.daily_limit}
                                    onChange={(e) => setFormData({ ...formData, daily_limit: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex space-x-3 space-x-reverse">
                                <button
                                    type="submit"
                                    disabled={agents.length === 0}
                                    className={`flex-1 ${agents.length === 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 rounded-lg font-bold transition-colors`}
                                >
                                    تأكيد الإنشاء
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
