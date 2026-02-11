<?php

namespace Database\Seeders;

use App\Models\WithdrawalType;
use Illuminate\Database\Seeder;

class WithdrawalTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'كاش (Cash)'],
            ['name' => 'شيك (Check)'],
            ['name' => 'دين (Debt)'],
            ['name' => 'تحويل بنكي (Bank Transfer)'],
        ];

        foreach ($types as $type) {
            WithdrawalType::firstOrCreate($type);
        }
    }
}
