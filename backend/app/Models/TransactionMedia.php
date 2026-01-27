<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionMedia extends Model
{
    protected $fillable = [
        'transaction_id',
        'image_url',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
