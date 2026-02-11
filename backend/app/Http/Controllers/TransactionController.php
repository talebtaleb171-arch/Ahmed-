<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Transaction;
use App\Models\TransactionMedia;
use App\Services\TransactionService;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(Request $request)
    {
        $query = Transaction::with(['cashBox', 'creator', 'media', 'withdrawalType']);

        if ($request->has('cashbox_id')) {
            $query->where('cashbox_id', $request->cashbox_id);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        if ($request->user()->role !== 'admin') {
            $query->where('created_by', $request->user()->id);
        }

        if ($request->has('no_paginate')) {
            return response()->json(['data' => $query->latest()->get()]);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function stats(Request $request)
    {
        $query = Transaction::query();
        if ($request->user()->role !== 'admin') {
            $query->where('created_by', $request->user()->id);
        }

        $pending = (clone $query)->where('status', 'pending')->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $rejected = (clone $query)->where('status', 'rejected')->count();

        return response()->json([
            'pending' => $pending,
            'approved' => $approved,
            'rejected' => $rejected,
            'total' => $pending + $approved + $rejected
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cashbox_id' => 'required|exists:cash_boxes,id',
            'type' => 'required|in:deposit,withdrawal',
            'amount' => 'required|numeric|min:0.01',
            'images' => 'required|array|min:1',
            'images.*' => 'image|max:5120', // 5MB max
            'withdrawal_type_id' => 'nullable|exists:withdrawal_types,id',
            'account_number' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $transaction = Transaction::create([
            'cashbox_id' => $request->cashbox_id,
            'type' => $request->type,
            'amount' => $request->amount,
            'balance_before' => 0, // Will be set on approval
            'balance_after' => 0,  // Will be set on approval
            'status' => 'pending',
            'created_by' => $request->user()->id,
            'withdrawal_type_id' => $request->withdrawal_type_id,
            'account_number' => $request->account_number,
            'phone_number' => $request->phone_number,
            'notes' => $request->notes,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('transactions', 'public');
                TransactionMedia::create([
                    'transaction_id' => $transaction->id,
                    'image_url' => asset('storage/' . $path),
                ]);
            }
        }

        return response()->json($transaction->load('media'), 201);
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'يمكن تعديل العمليات المعلقة فقط'], 422);
        }

        $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'withdrawal_type_id' => 'nullable|exists:withdrawal_types,id',
            'account_number' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $transaction->update($request->only([
            'amount',
            'withdrawal_type_id',
            'account_number',
            'phone_number',
            'notes'
        ]));

        return response()->json($transaction->load('withdrawalType'));
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->status !== 'pending' && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'لا يمكن حذف العمليات المعتمدة إلا من قبل المسؤول'], 403);
        }

        $transaction->delete(); // This triggers soft delete
        return response()->json(['message' => 'تم حذف العملية بنجاح']);
    }

    public function approve(Transaction $transaction, Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($this->transactionService->approve($transaction, $request->user()->id));
    }

    public function reject(Transaction $transaction, Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['reason' => 'required|string']);

        return response()->json($this->transactionService->reject($transaction, $request->user()->id, $request->reason));
    }
}
