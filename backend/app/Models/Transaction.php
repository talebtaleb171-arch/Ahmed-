<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
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
    ];

    public function cashBox()
    {
        return $this->belongsTo(CashBox::class);
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
