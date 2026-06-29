<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\Expense;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->toDateString();

        // Stats calculations
        $todaySales = Invoice::where('date', $today)->sum('total');
        $todayReceived = Invoice::where('date', $today)->sum('paid') + \App\Models\CustomerPayment::where('date', $today)->sum('amount');
        
        $totalUdharCustomer = Customer::sum('balance');
        $totalPayableVendor = Vendor::sum('balance');

        $totalExpenses = Expense::sum('amount');
        $lowStockProducts = Product::whereColumn('stock', '<=', 'min_stock')->get();
        
        $recentInvoices = Invoice::orderBy('id', 'desc')->take(5)->get();

        return view('dashboard', compact(
            'todaySales',
            'todayReceived',
            'totalUdharCustomer',
            'totalPayableVendor',
            'totalExpenses',
            'lowStockProducts',
            'recentInvoices'
        ));
    }
}
