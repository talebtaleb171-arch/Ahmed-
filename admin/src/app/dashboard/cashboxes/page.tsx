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
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">إدارة الصناديق</h2>
                    <p className="text-slate-500 mt-3 text-lg font-medium">إدارة الصناديق الرئيسية والفرعية وتوزيع المهام</p>
                </div>
                <div className="flex space-x-4 space-x-reverse">
                    {mainBox && (
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                            <span className="text-sm font-bold text-gray-500 ml-3 uppercase tracking-wider">رصيد الرئيسي:</span>
                            <span className="font-black text-xl text-indigo-600 tracking-tight">{mainBox.balance} MRU</span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowModal(true)}
                        className="premium-gradient text-white px-8 py-3 rounded-2xl shadow-xl shadow-indigo-500/20 font-bold hover:opacity-90 transition-all flex items-center"
                    >
                        <Plus className="ml-2 h-5 w-5" />
                        إضافة صندوق جديد
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Main Box Card */}
                {mainBox && (
                    <div key={mainBox.id} className="premium-gradient rounded-[2.5rem] shadow-2xl p-10 text-white relative group overflow-hidden border border-white/5">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                        <div className="absolute top-6 left-6 flex space-x-3 space-x-reverse opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <button
                                onClick={() => { setSelectedBox(mainBox); setFundType('deposit'); setShowFundModal(true); }}
                                className="bg-white/10 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/20 border border-white/10 transition-colors"
                                title="تعبئة (إيداع)"
                            >
                                <ArrowUpCircle className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => { setSelectedBox(mainBox); setFundType('withdrawal'); setShowFundModal(true); }}
                                className="bg-white/10 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/20 border border-white/10 transition-colors"
                                title="سحب خارجي"
                            >
                                <ArrowDownCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between mb-10 relative">
                            <div className="flex items-center space-x-5 space-x-reverse">
                                <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/10">
                                    <Wallet className="h-8 w-8 text-indigo-300" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">{mainBox.name}</h3>
                                    <p className="text-sm text-indigo-300/80 font-bold tracking-wide uppercase mt-1">الصندوق المركزي</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 pt-10 border-t border-white/5 relative">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">الرصيد الكلي المتاح</span>
                                <span className="text-5xl font-black tracking-tighter">{mainBox.balance} <span className="text-xl text-indigo-300/60 font-black ml-1">MRU</span></span>
                            </div>
                            <div className="flex justify-between items-center bg-indigo-500/10 px-6 py-3 rounded-2xl border border-white/5">
                                <span className="text-sm font-bold opacity-70 tracking-wide uppercase">حالة الحساب</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                    <span className="text-sm font-black text-emerald-400">نشط الآن</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub Boxes Cards */}
                {subBoxes.map((box) => (
                    <div key={box.id} className="glass-card rounded-[2.5rem] p-10 border-white/40 hover:scale-[1.03] transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-6 left-6 flex space-x-3 space-x-reverse opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <button
                                onClick={() => { setSelectedBox(box); setFundType('deposit'); setShowFundModal(true); }}
                                className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl hover:bg-emerald-100 transition-colors border border-emerald-100"
                                title="شحن رصيد"
                            >
                                <ArrowUpCircle className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => { setSelectedBox(box); setFundType('withdrawal'); setShowFundModal(true); }}
                                className="bg-red-50 text-red-600 p-3 rounded-2xl hover:bg-red-100 transition-colors border border-red-100"
                                title="سحب الرصيد للمركزي"
                            >
                                <ArrowDownCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-5 space-x-reverse mb-10">
                            <div className="bg-slate-100 p-5 rounded-3xl text-slate-600 border border-slate-200">
                                <Wallet className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{box.name}</h3>
                                <p className="text-sm text-slate-500 font-bold flex items-center mt-1">
                                    <Shield className="ml-1.5 h-4 w-4 text-indigo-500" />
                                    الوكيل: {box.owner?.name || 'غير معروف'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6 pt-10 border-t border-slate-100/50">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الرصيد الحالي</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{box.balance} <span className="text-sm text-slate-400 font-bold ml-1 uppercase">MRU</span></span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الحد اليومي</span>
                                    <span className="text-xl font-black text-slate-600 tracking-tight">{box.daily_limit}</span>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-3/4 rounded-full opacity-60"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fund/Withdraw Modal */}
            {showFundModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-white/20">
                        <div className={`${fundType === 'deposit' ? 'bg-emerald-600' : 'bg-red-600'} px-10 py-8 text-white flex justify-between items-center relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-2xl font-black tracking-tight relative z-10">
                                {selectedBox?.type === 'main'
                                    ? (fundType === 'deposit' ? 'تعبئة الصندوق الرئيسي' : 'سحب خارجي')
                                    : (fundType === 'deposit' ? 'إيداع رصيد للوكيل' : 'سحب الرصيد للمركزي')}
                            </h3>
                            <button onClick={() => setShowFundModal(false)} className="text-white bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors relative z-10 border border-white/20">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleFund} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">الصندوق المستهدف</p>
                                <p className="text-2xl font-black text-slate-900">{selectedBox?.name}</p>
                                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-tight opacity-70">
                                    {selectedBox?.owner?.name || (selectedBox?.type === 'main' ? 'المسؤول الرئيسي' : '')}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">المبلغ المطلوب (MRU)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0.00"
                                        className={`w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-right focus:ring-4 focus:bg-white transition-all ${fundType === 'deposit' ? 'focus:ring-emerald-500/10 focus:border-emerald-500' : 'focus:ring-red-500/10 focus:border-red-500'} outline-none text-4xl font-black text-slate-900`}
                                        value={fundAmount}
                                        onChange={(e) => setFundAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            {fundType === 'withdrawal' && (
                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">نوع السحب</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none cursor-pointer font-bold text-slate-700"
                                            value={detailedFund.withdrawal_type_id}
                                            onChange={(e) => setDetailedFund({ ...detailedFund, withdrawal_type_id: e.target.value })}
                                            required
                                        >
                                            <option value="">اختر النوع...</option>
                                            {withdrawalTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">رقم الحساب</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold"
                                                value={detailedFund.account_number}
                                                onChange={(e) => setDetailedFund({ ...detailedFund, account_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">رقم الهاتف</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold"
                                                value={detailedFund.phone_number}
                                                onChange={(e) => setDetailedFund({ ...detailedFund, phone_number: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">ملاحظات إضافية</label>
                                        <textarea
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none h-24 font-bold"
                                            value={detailedFund.notes}
                                            onChange={(e) => setDetailedFund({ ...detailedFund, notes: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">إثبات العملية (صور)</label>
                                        <div className="mt-1 group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-8 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden">
                                            <input
                                                type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                onChange={(e) => e.target.files && setFundImages(Array.from(e.target.files))}
                                            />
                                            <div className="text-center relative z-10">
                                                <div className="bg-slate-100 p-4 rounded-full mb-3 group-hover:bg-indigo-100 transition-colors inline-block">
                                                    <Camera className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                                                </div>
                                                <span className="block text-sm font-black text-slate-500 group-hover:text-indigo-700">
                                                    {fundImages.length > 0 ? `تم اختيار ${fundImages.length} صور` : 'اسحب الصور هنا أو اضغط للاختيار'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full ${fundType === 'deposit' ? 'bg-emerald-600 shadow-emerald-500/30 hover:bg-emerald-700' : 'bg-red-600 shadow-red-500/30 hover:bg-red-700'} text-white py-6 rounded-3xl font-black text-xl transition-all shadow-xl hover:-translate-y-1 active:scale-95`}
                            >
                                تأكيد العملية الآن
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Box Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-white/20">
                        <div className="premium-gradient px-10 py-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-2xl font-black tracking-tight relative z-10">إنشاء صندوق جديد</h3>
                            <button onClick={() => setShowModal(false)} className="text-white bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors relative z-10 border border-white/20">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">اسم الصندوق</label>
                                <input
                                    type="text" required placeholder="مثلاً: وكالة تفرغ زينة"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">الوكيل المسؤول</label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none cursor-pointer font-bold text-slate-900"
                                    value={formData.owner_id}
                                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                                >
                                    <option value="">اختر الوكيل...</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name} ({agent.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-right">الحد اليومي للإيداعات (MRU)</label>
                                <input
                                    type="number" required
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-right focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900"
                                    value={formData.daily_limit}
                                    onChange={(e) => setFormData({ ...formData, daily_limit: e.target.value })}
                                />
                            </div>
                            <div className="pt-6 flex space-x-4 space-x-reverse">
                                <button
                                    type="submit"
                                    disabled={agents.length === 0}
                                    className="flex-1 premium-gradient text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                >
                                    تأكيد وإنشاء الصندوق
                                </button>
                                <button
                                    type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all border border-slate-200"
                                >
                                    إلغاء النافذة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
