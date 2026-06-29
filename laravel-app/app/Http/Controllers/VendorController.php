<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vendor;
use App\Models\VendorPayment;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = Vendor::with('payments')->orderBy('name', 'asc')->get();
        return view('vendors.index', compact('vendors'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'city' => 'nullable|string',
            'company' => 'nullable|string',
            'balance' => 'nullable|numeric|min:0',
        ]);

        Vendor::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'city' => $request->city,
            'company' => $request->company,
            'balance' => $request->balance ?? 0,
        ]);

        return redirect()->route('vendors.index')->with('success', 'Supplier account ledger created successfully.');
    }

    public function payVendor(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $vendor = Vendor::findOrFail($id);
        
        // Subtract from company's due balance
        $vendor->balance = max(0, $vendor->balance - $request->amount);
        $vendor->save();

        $payment = VendorPayment::create([
            'vendor_id' => $vendor->id,
            'amount' => $request->amount,
            'date' => $request->date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('vendors.index')
            ->with('success', 'Payment to supplier registered successfully!')
            ->with('print_vendor_payment_id', $payment->id);
    }

    public function printPayment($id)
    {
        $payment = VendorPayment::with('vendor')->findOrFail($id);
        $allPayments = VendorPayment::where('vendor_id', $payment->vendor_id)->orderBy('date', 'asc')->get();

        return view('print.vendor-ledger', [
            'payment' => $payment,
            'vendor' => $payment->vendor,
            'payments' => $allPayments,
        ]);
    }

    public function destroy($id)
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->delete();
        return redirect()->route('vendors.index')->with('success', 'Supplier record removed.');
    }
}
