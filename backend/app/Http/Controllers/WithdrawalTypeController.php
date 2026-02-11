<?php

namespace App\Http\Controllers;

use App\Models\WithdrawalType;
use Illuminate\Http\Request;

class WithdrawalTypeController extends Controller
{
    public function index()
    {
        return response()->json(WithdrawalType::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $type = WithdrawalType::create($request->all());
        return response()->json($type, 201);
    }

    public function show(WithdrawalType $withdrawalType)
    {
        return response()->json($withdrawalType);
    }

    public function update(Request $request, WithdrawalType $withdrawalType)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'is_active' => 'sometimes|required|boolean',
        ]);

        $withdrawalType->update($request->all());
        return response()->json($withdrawalType);
    }

    public function destroy(WithdrawalType $withdrawalType)
    {
        $withdrawalType->delete();
        return response()->json(null, 204);
    }
}
