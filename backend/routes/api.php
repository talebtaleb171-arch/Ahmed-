<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CashBoxController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('users', UserController::class);
    Route::post('/cashboxes/{cashbox}/fund', [CashBoxController::class, 'fund']);
    Route::apiResource('cashboxes', CashBoxController::class);
    Route::apiResource('withdrawal-types', \App\Http\Controllers\WithdrawalTypeController::class);

    Route::get('/transactions/stats', [TransactionController::class, 'stats']);
    Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('/transactions/{transaction}/approve', [TransactionController::class, 'approve']);
    Route::post('/transactions/{transaction}/reject', [TransactionController::class, 'reject']);
    Route::get('/reports/export', [\App\Http\Controllers\ReportController::class, 'export']);
});
