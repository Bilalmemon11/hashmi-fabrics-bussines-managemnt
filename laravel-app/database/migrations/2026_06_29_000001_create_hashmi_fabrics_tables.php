<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Customers Table
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('type')->default('retail'); // retail, wholesale
            $table->decimal('balance', 15, 2)->default(0); // Udhar (Outstanding Balance)
            $table->timestamps();
        });

        // 2. Vendors (Suppliers) Table
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('company')->nullable();
            $table->decimal('balance', 15, 2)->default(0); // Payable balance to Supplier
            $table->timestamps();
        });

        // 3. Products (Inventory) Table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('sku')->nullable();
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('sale_price', 12, 2)->default(0);
            $table->integer('stock')->default(0); // Yards or meters or suits quantity
            $table->integer('min_stock')->default(10); // Alert threshold
            $table->timestamps();
        });

        // 4. Invoices (Sales) Table
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no')->unique();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->date('date');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('total', 15, 2);
            $table->decimal('paid', 15, 2)->default(0);
            $table->decimal('balance', 15, 2)->default(0); // Udhar generated from invoice
            $table->string('payment_type')->default('cash'); // cash, credit
            $table->timestamps();
        });

        // 5. Invoice Items Table
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('product_name');
            $table->integer('qty');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();
        });

        // 6. Customer Payments (Udhar Received History)
        Schema::create('customer_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 7. Vendor Payments (Paid to Supplier History)
        Schema::create('vendor_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 8. Expenses Table
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->date('date');
            $table->decimal('amount', 12, 2);
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('vendor_payments');
        Schema::dropIfExists('customer_payments');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('products');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('customers');
    }
};
