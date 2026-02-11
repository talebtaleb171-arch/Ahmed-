<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CashBox;
use App\Models\Transaction;
use App\Models\TransactionMedia;

class CashBoxController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json(CashBox::with('owner')->get());
        }

        return response()->json(CashBox::where('owner_id', $user->id)->get());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string',
            'owner_id' => 'required|exists:users,id',
            'daily_limit' => 'nullable|numeric',
        ]);

        $cashBox = CashBox::create([
            'name' => $request->name,
            'type' => 'sub',
            'owner_id' => $request->owner_id,
            'parent_cashbox_id' => CashBox::where('type', 'main')->first()->id,
            'balance' => 0,
            'daily_limit' => $request->daily_limit,
            'status' => 'active',
        ]);

        return response()->json($cashBox, 201);
    }

    public function show(CashBox $cashBox)
    {
        return response()->json($cashBox->load(['owner', 'transactions.media']));
    }

    public function fund(Request $request, $cashboxId)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'type' => 'nullable|in:deposit,withdrawal',
            'withdrawal_type_id' => 'nullable|exists:withdrawal_types,id',
            'account_number' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
        ]);

        $cashBox = CashBox::find($cashboxId);
        if (!$cashBox) {
            return response()->json(['message' => "Cashbox not found with ID: {$cashboxId}"], 404);
        }

        $type = $request->get('type', 'deposit');
        $mainBox = CashBox::where('type', 'main')->first();

        if (!$mainBox) {
            return response()->json(['message' => 'Main cashbox not found in database'], 404);
        }

        // Action on MAIN box (External Deposit/Withdrawal)
        if ($cashBox->id == $mainBox->id || $cashBox->type === 'main') {
            if ($type === 'withdrawal' && $cashBox->balance < $request->amount) {
                return response()->json(['message' => "Insufficient funds in main box to withdraw {$request->amount}"], 400);
            }

            \Illuminate\Support\Facades\DB::transaction(function () use ($cashBox, $request, $type) {
                if ($type === 'deposit') {
                    $cashBox->balance += $request->amount;
                } else {
                    $cashBox->balance -= $request->amount;
                }
                $cashBox->save();

                $transaction = Transaction::create([
                    'cashbox_id' => $cashBox->id,
                    'type' => $type,
                    'amount' => $request->amount,
                    'status' => 'approved',
                    'balance_before' => $type === 'deposit' ? $cashBox->balance - $request->amount : $cashBox->balance + $request->amount,
                    'balance_after' => $cashBox->balance,
                    'created_by' => $request->user()->id,
                    'approved_by' => $request->user()->id,
                    'withdrawal_type_id' => $request->withdrawal_type_id,
                    'account_number' => $request->account_number,
                    'phone_number' => $request->phone_number,
                    'notes' => $request->notes ?? ($type === 'deposit' ? 'إيداع خارجي مباشر في الصندوق الرئيسي' : 'سحب خارجي مباشر من الصندوق الرئيسي'),
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
            });

            return response()->json(['message' => 'Operation completed successfully', 'balance' => $cashBox->balance]);
        }

        // Action on SUB box (Transfer between Main and Sub)
        \Illuminate\Support\Facades\DB::transaction(function () use ($cashBox, $mainBox, $request, $type) {
            if ($type === 'deposit') {
                // Main -> Sub
                if ($mainBox->balance < $request->amount) {
                    throw new \Exception('Insufficient balance in main cashbox');
                }
                $mainBox->balance -= $request->amount;
                $cashBox->balance += $request->amount;
            } else {
                // Sub -> Main
                if ($cashBox->balance < $request->amount) {
                    throw new \Exception('Insufficient balance in sub-box');
                }
                $cashBox->balance -= $request->amount;
                $mainBox->balance += $request->amount;
            }

            $mainBox->save();
            $cashBox->save();

            $transaction = Transaction::create([
                'cashbox_id' => $cashBox->id,
                'type' => $type,
                'amount' => $request->amount,
                'status' => 'approved',
                'balance_before' => $type === 'deposit' ? $cashBox->balance - $request->amount : $cashBox->balance + $request->amount,
                'balance_after' => $cashBox->balance,
                'created_by' => $request->user()->id,
                'approved_by' => $request->user()->id,
                'withdrawal_type_id' => $request->withdrawal_type_id,
                'account_number' => $request->account_number,
                'phone_number' => $request->phone_number,
                'notes' => $request->notes ?? ($type === 'deposit' ? 'تمويل من الصندوق الرئيسي' : 'سحب الرصيد إلى الصندوق الرئيسي'),
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
        });

        return response()->json(['message' => 'Successfully updated cashbox balance', 'balance' => $cashBox->balance]);
    }
}
