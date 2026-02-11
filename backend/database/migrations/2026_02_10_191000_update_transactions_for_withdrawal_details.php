<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('withdrawal_type_id')->nullable()->constrained('withdrawal_types');
            $table->string('account_number')->nullable();
            $table->string('phone_number')->nullable();
            $table->text('notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('withdrawal_type_id');
            $table->dropColumn(['account_number', 'phone_number']);
        });
    }
};
