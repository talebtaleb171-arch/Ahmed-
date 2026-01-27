<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@caisse.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        \App\Models\CashBox::create([
            'name' => 'الصندوق الرئيسي',
            'type' => 'main',
            'owner_id' => $admin->id,
            'balance' => 0,
            'status' => 'active',
        ]);
    }
}
