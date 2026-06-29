<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\CustomerPayment;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::with('payments')->orderBy('name', 'asc')->get();
        return view('customers.index', compact('customers'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'city' => 'nullable|string',
            'type' => 'required|string|in:retail,wholesale',
            'balance' => 'nullable|numeric|min:0',
        ]);

        Customer::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'city' => $request->city,
            'type' => $request->type,
            'balance' => $request->balance ?? 0,
        ]);

        return redirect()->route('customers.index')->with('success', 'Customer accounts ledger created successfully!');
    }

    public function receivePayment(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $customer = Customer::findOrFail($id);
        
        // Subtract from customer's outstanding balance
        $customer->balance = max(0, $customer->balance - $request->amount);
        $customer->save();

        // Create payment history entry
        $payment = CustomerPayment::create([
            'customer_id' => $customer->id,
            'amount' => $request->amount,
            'date' => $request->date,
            'notes' => $request->notes,
        ]);

        // Redirect with a success flag and specific key to auto-open print modal
        return redirect()->route('customers.index')
            ->with('success', 'Udhar Payment received successfully!')
            ->with('print_payment_id', $payment->id);
    }

    public function printPayment($id)
    {
        $payment = CustomerPayment::with('customer')->findOrFail($id);
        
        // Fetch all payments for this customer to show in ledger printout
        $allPayments = CustomerPayment::where('customer_id', $payment->customer_id)->orderBy('date', 'asc')->get();
        
        return view('print.customer-ledger', [
            'payment' => $payment,
            'customer' => $payment->customer,
            'payments' => $allPayments,
        ]);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();
        return redirect()->route('customers.index')->with('success', 'Customer record deleted.');
    }
}
