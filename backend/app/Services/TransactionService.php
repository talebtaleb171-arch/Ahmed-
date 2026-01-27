<?php

namespace App\Services;

use App\Models\CashBox;
use App\Models\Transaction;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function approve(Transaction $transaction, $adminId)
    {
        return DB::transaction(function () use ($transaction, $adminId) {
            $cashBox = $transaction->cashBox;
            $mainBox = CashBox::where('type', 'main')->first();

            if ($transaction->type === 'deposit') {
                $cashBox->balance += $transaction->amount;
                $mainBox->balance -= $transaction->amount;
            } else {
                $cashBox->balance -= $transaction->amount;
                $mainBox->balance += $transaction->amount;
            }

            $cashBox->save();
            $mainBox->save();

            $transaction->status = 'approved';
            $transaction->approved_by = $adminId;
            $transaction->balance_before = $cashBox->balance - ($transaction->type === 'deposit' ? $transaction->amount : -$transaction->amount);
            $transaction->balance_after = $cashBox->balance;
            $transaction->save();

            AuditLog::create([
                'user_id' => $adminId,
                'action' => 'approve_transaction',
                'entity' => 'transaction',
                'entity_id' => $transaction->id,
                'metadata' => ['amount' => $transaction->amount, 'type' => $transaction->type]
            ]);

            return $transaction;
        });
    }

    public function reject(Transaction $transaction, $adminId, $reason)
    {
        $transaction->status = 'rejected';
        $transaction->approved_by = $adminId;
        $transaction->reason = $reason;
        $transaction->save();

        AuditLog::create([
            'user_id' => $adminId,
            'action' => 'reject_transaction',
            'entity' => 'transaction',
            'entity_id' => $transaction->id,
            'metadata' => ['reason' => $reason]
        ]);

        return $transaction;
    }
}
