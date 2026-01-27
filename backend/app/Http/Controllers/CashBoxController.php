<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\CashBox;

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
}
