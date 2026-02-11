<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'cashbox_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'status',
        'reason',
        'created_by',
        'approved_by',
        'withdrawal_type_id',
        'account_number',
        'phone_number',
        'notes',
    ];

    public function withdrawalType()
    {
        return $this->belongsTo(WithdrawalType::class);
    }

    public function cashBox()
    {
        return $this->belongsTo(CashBox::class, 'cashbox_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function media()
    {
        return $this->hasMany(TransactionMedia::class);
    }
}
