<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Expense;
use App\Models\CustomerPayment;
use App\Models\VendorPayment;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

        // 1. Sales & Revenue in this period
        $totalSales = Invoice::whereBetween('date', [$startDate, $endDate])->sum('total');
        $totalReceivedSales = Invoice::whereBetween('date', [$startDate, $endDate])->sum('paid');

        // 2. Cost of Goods Sold (COGS) Calculation
        // Fetch invoice items created in the range
        $invoiceItems = InvoiceItem::whereHas('invoice', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        })->get();

        $cogs = 0;
        foreach ($invoiceItems as $item) {
            $product = \App\Models\Product::find($item->product_id);
            $costPrice = $product ? $product->cost_price : 0;
            $cogs += ($item->qty * $costPrice);
        }

        $grossProfit = max(0, $totalSales - $cogs);

        // 3. Operating Expenses
        $totalExpenses = Expense::whereBetween('date', [$startDate, $endDate])->sum('amount');

        // 4. Net Profit or Loss
        $netProfit = $grossProfit - $totalExpenses;

        // 5. Additional Cash Flow metrics
        $directUdharPayments = CustomerPayment::whereBetween('date', [$startDate, $endDate])->sum('amount');
        $paymentsToSuppliers = VendorPayment::whereBetween('date', [$startDate, $endDate])->sum('amount');

        return view('reports.index', compact(
            'startDate',
            'endDate',
            'totalSales',
            'cogs',
            'grossProfit',
            'totalExpenses',
            'netProfit',
            'directUdharPayments',
            'paymentsToSuppliers'
        ));
    }
}
