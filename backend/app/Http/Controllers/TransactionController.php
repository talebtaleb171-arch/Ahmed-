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
        $query = Transaction::with(['cashBox', 'creator', 'media']);

        if ($request->has('cashbox_id')) {
            $query->where('cashbox_id', $request->cashbox_id);
        }

        if ($request->user()->role !== 'admin') {
            $query->where('created_by', $request->user()->id);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'cashbox_id' => 'required|exists:cash_boxes,id',
            'type' => 'required|in:deposit,withdrawal',
            'amount' => 'required|numeric|min:0.01',
            'images' => 'required|array|min:1',
            'images.*' => 'image|max:5120', // 5MB max
        ]);

        $transaction = Transaction::create([
            'cashbox_id' => $request->cashbox_id,
            'type' => $request->type,
            'amount' => $request->amount,
            'balance_before' => 0, // Will be set on approval
            'balance_after' => 0,  // Will be set on approval
            'status' => 'pending',
            'created_by' => $request->user()->id,
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
