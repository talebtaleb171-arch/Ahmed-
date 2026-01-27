<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CashBoxController;
use App\Http\Controllers\TransactionController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('cashboxes', CashBoxController::class);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::post('/transactions/{transaction}/approve', [TransactionController::class, 'approve']);
    Route::post('/transactions/{transaction}/reject', [TransactionController::class, 'reject']);
    Route::get('/reports/export', [\App\Http\Controllers\ReportController::class, 'export']);
});
