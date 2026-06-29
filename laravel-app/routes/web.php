<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| Web Routes - Hashmi Fabrics Business Suite
|--------------------------------------------------------------------------
*/

// 1. Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// 2. Customers Ledgers & Receipts
Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/', [CustomerController::class, 'store'])->name('customers.store');
    Route::post('/{id}/receive-payment', [CustomerController::class, 'receivePayment'])->name('customers.receive-payment');
    Route::get('/payments/{id}/print', [CustomerController::class, 'printPayment'])->name('customers.print-payment');
    Route::delete('/{id}', [CustomerController::class, 'destroy'])->name('customers.destroy');
});

// 3. Supplier Mills Ledgers & Vouchers
Route::prefix('vendors')->group(function () {
    Route::get('/', [VendorController::class, 'index'])->name('vendors.index');
    Route::post('/', [VendorController::class, 'store'])->name('vendors.store');
    Route::post('/{id}/pay', [VendorController::class, 'payVendor'])->name('vendors.pay-vendor');
    Route::get('/payments/{id}/print', [VendorController::class, 'printPayment'])->name('vendors.print-payment');
    Route::delete('/{id}', [VendorController::class, 'destroy'])->name('vendors.destroy');
});

// 4. Products Inventory Catalog
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->name('products.index');
    Route::post('/', [ProductController::class, 'store'])->name('products.store');
    Route::put('/{id}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/{id}', [ProductController::class, 'destroy'])->name('products.destroy');
});

// 5. Fabric Billing & Invoices
Route::prefix('invoices')->group(function () {
    Route::get('/', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::post('/', [InvoiceController::class, 'store'])->name('invoices.store');
    Route::get('/{id}/print', [InvoiceController::class, 'print'])->name('invoices.print');
    Route::delete('/{id}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');
});

// 6. Shop Expenses
Route::prefix('expenses')->group(function () {
    Route::get('/', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('/', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::delete('/{id}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
});

// 7. Reports & P&L Statement
Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
