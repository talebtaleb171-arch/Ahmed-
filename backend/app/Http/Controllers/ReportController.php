<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function export(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions_report.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Date', 'Box', 'Agent', 'Type', 'Amount', 'Status']);

            Transaction::with(['cashBox', 'creator'])->chunk(100, function ($transactions) use ($file) {
                foreach ($transactions as $t) {
                    fputcsv($file, [
                        $t->id,
                        $t->created_at,
                        $t->cashBox->name,
                        $t->creator->name,
                        $t->type,
                        $t->amount,
                        $t->status,
                    ]);
                }
            });

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
