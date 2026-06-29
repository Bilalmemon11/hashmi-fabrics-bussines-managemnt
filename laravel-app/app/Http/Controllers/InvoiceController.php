<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with('customer')->orderBy('id', 'desc')->get();
        $customers = Customer::orderBy('name', 'asc')->get();
        $products = Product::where('stock', '>', 0)->orderBy('name', 'asc')->get();

        return view('invoices.index', compact('invoices', 'customers', 'products'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'paid' => 'required|numeric|min:0',
            'payment_type' => 'required|in:cash,credit',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $customer = Customer::findOrFail($request->customer_id);

        try {
            $invoice = DB::transaction(function () use ($request, $customer) {
                // Generate clean invoice number
                $lastInvoice = Invoice::orderBy('id', 'desc')->first();
                $nextId = $lastInvoice ? $lastInvoice->id + 1 : 1;
                $invoiceNo = 'INV-' . date('Ymd') . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

                $subtotal = 0;
                $lineItemsData = [];

                foreach ($request->items as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    
                    // Stock check
                    if ($product->stock < $item['qty']) {
                        throw new \Exception("Insufficient stock for fabric: " . $product->name . " (Available: " . $product->stock . ")");
                    }

                    $totalItemPrice = $item['qty'] * $item['unit_price'];
                    $subtotal += $totalItemPrice;

                    // Subtract stock
                    $product->stock -= $item['qty'];
                    $product->save();

                    $lineItemsData[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'qty' => $item['qty'],
                        'unit_price' => $item['unit_price'],
                        'total' => $totalItemPrice,
                    ];
                }

                $discount = $request->discount ?? 0;
                $total = max(0, $subtotal - $discount);
                $paid = $request->paid;
                $balance = max(0, $total - $paid);

                // Create Invoice
                $invoice = Invoice::create([
                    'invoice_no' => $invoiceNo,
                    'customer_id' => $customer->id,
                    'customer_name' => $customer->name,
                    'customer_phone' => $customer->phone,
                    'date' => $request->date,
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'total' => $total,
                    'paid' => $paid,
                    'balance' => $balance,
                    'payment_type' => $request->payment_type,
                ]);

                // Create Invoice Items
                foreach ($lineItemsData as $lineItem) {
                    $invoice->items()->create($lineItem);
                }

                // Add outstanding balance (Udhar) to customer account ledger
                if ($balance > 0) {
                    $customer->balance += $balance;
                    $customer->save();
                }

                return $invoice;
            });

            // Redirect with direct invoice print action
            return redirect()->route('invoices.index')
                ->with('success', 'Fabric sales invoice created and stock updated!')
                ->with('print_invoice_id', $invoice->id);

        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function show($id)
    {
        $invoice = Invoice::with('items')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $invoice
        ]);
    }

    public function print($id)
    {
        $invoice = Invoice::with('items')->findOrFail($id);
        return view('print.invoice', compact('invoice'));
    }

    public function destroy($id)
    {
        $invoice = Invoice::with('items')->findOrFail($id);

        // Refund product stock and subtract from customer balance
        DB::transaction(function () use ($invoice) {
            foreach ($invoice->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->stock += $item->qty;
                    $product->save();
                }
            }

            // Reduce customer balance if any was added
            if ($invoice->balance > 0) {
                $customer = Customer::find($invoice->customer_id);
                if ($customer) {
                    $customer->balance = max(0, $customer->balance - $invoice->balance);
                    $customer->save();
                }
            }

            $invoice->delete();
        });

        return redirect()->route('invoices.index')->with('success', 'Invoice deleted. Stock reversed and customer ledger recalculated.');
    }
}
