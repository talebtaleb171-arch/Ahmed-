<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cash_boxes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['main', 'sub'])->default('sub');
            $table->foreignId('owner_id')->constrained('users');
            $table->foreignId('parent_cashbox_id')->nullable()->constrained('cash_boxes');
            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('daily_limit', 15, 2)->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_boxes');
    }
};
