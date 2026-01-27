<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashBox extends Model
{
    protected $fillable = [
        'name',
        'type',
        'owner_id',
        'parent_cashbox_id',
        'balance',
        'daily_limit',
        'status',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function parent()
    {
        return $this->belongsTo(CashBox::class, 'parent_cashbox_id');
    }

    public function children()
    {
        return $this->hasMany(CashBox::class, 'parent_cashbox_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
