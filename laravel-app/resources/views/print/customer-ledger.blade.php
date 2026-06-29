<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Payment Statement - Hashmi Fabrics</title>
    <!-- Tailwind CDN for standard layouts -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            color: #000000;
            background: #ffffff;
        }
        @media print {
            .no-print {
                display: none !important;
            }
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body class="p-8 max-w-4xl mx-auto">

    <!-- Top print actions bar (hidden during print) -->
    <div class="no-print mb-6 flex justify-between items-center bg-gray-100 p-4 rounded-xl border border-gray-200">
        <span class="text-xs text-gray-600 font-bold">Print Preview — Ledger Statement</span>
        <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1">
            Print Slip / Save PDF
        </button>
    </div>

    <!-- Header Invoice Branding -->
    <div class="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
            <h1 class="text-3xl font-black uppercase tracking-tight">Hashmi Fabrics</h1>
            <p class="text-xs font-bold text-gray-700 mt-1">Wholesale & Retail Fabrics Ledger Registry</p>
            <p class="text-[10px] text-gray-500 mt-0.5">Faisalabad, Pakistan • Phone: 0300-1234567</p>
        </div>
        <div class="text-right">
            <span class="inline-block bg-black text-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider">Payment Receipt</span>
            <p class="text-[10px] text-gray-600 mt-2 font-mono">Date: {{ date('d-M-Y') }}</p>
        </div>
    </div>

    <!-- Current payment highlights box -->
    <div class="bg-gray-100 border border-gray-300 p-4 rounded-xl mb-6">
        <p class="text-gray-500 font-bold uppercase text-[9px]">Received Payment Highlight:</p>
        <div class="flex justify-between items-center mt-2">
            <div>
                <p class="text-sm font-bold text-black">Depositor Customer:</p>
                <p class="text-lg font-black text-black">{{ $customer->name }}</p>
                <p class="text-xs text-gray-600">Category: {{ uppercase($customer->type) }} Client</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-bold text-gray-500">Amount Received:</p>
                <p class="text-2xl font-black text-green-700 font-mono">Rs. {{ number_format($payment->amount, 2) }}</p>
                <p class="text-[10px] text-gray-600">Reference: {{ $payment->notes ?? 'Direct cash settlement' }}</p>
            </div>
        </div>
    </div>

    <!-- Outstanding Summary -->
    <div class="grid grid-cols-2 gap-4 mb-6 text-xs border border-gray-300 p-3 rounded">
        <div>
            <span class="text-gray-500 font-bold uppercase text-[9px] block">Payment Date:</span>
            <p class="font-bold font-mono">{{ $payment->date }}</p>
        </div>
        <div class="text-right">
            <span class="text-gray-500 font-bold uppercase text-[9px] block">Remaining Outstanding Udhar:</span>
            <p class="font-bold text-red-600 font-mono text-sm">Rs. {{ number_format($customer->balance, 2) }}</p>
        </div>
    </div>

    <!-- COMPLETE ledger payment history table: "yani aj jo di and jo phely di thi" -->
    <div class="space-y-2">
        <h3 class="text-xs font-black uppercase tracking-wider border-b border-gray-400 pb-1">Historical Ledger Deposits Statement</h3>
        <p class="text-[10px] text-gray-500 mb-2">Here is the detailed chronologies of payments received from this customer account registry:</p>

        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="bg-gray-100 border-t border-b border-black font-bold uppercase text-[9px]">
                    <th class="py-2 px-3 w-12">#</th>
                    <th class="py-2 px-3">Deposit Date</th>
                    <th class="py-2 px-3">Reference Notes</th>
                    <th class="py-2 px-3 text-right pr-4">Amount Deposited (Rs)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 border-b border-black">
                @forelse($payments as $idx => $pay)
                    <tr class="{{ $pay->id == $payment->id ? 'bg-gray-50 font-bold' : '' }}">
                        <td class="py-2 px-3 font-mono text-gray-500">{{ $idx + 1 }}</td>
                        <td class="py-2 px-3 font-mono">{{ $pay->date }}</td>
                        <td class="py-2 px-3 text-gray-600">
                            {{ $pay->notes ?? 'Ledger Credit Settlement' }}
                            @if($pay->id == $payment->id)
                                <span class="ml-2 inline-block bg-green-100 text-green-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Today's</span>
                            @endif
                        </td>
                        <td class="py-2 px-3 text-right font-bold font-mono pr-4 text-green-700">Rs. {{ number_format($pay->amount, 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="py-4 text-center text-gray-500 italic">No historical payments recorded.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Authorizations signatures -->
    <div class="mt-20 pt-4 border-t border-gray-300 flex justify-between items-end text-[10px] text-gray-400">
        <div>
            <p class="font-bold text-gray-700 uppercase">System double-entry ledger</p>
            <p class="text-gray-500">Hashmi Fabrics Business Management Solutions.</p>
        </div>
        <div class="text-right w-1/3 border-t border-dashed border-gray-400 pt-6">
            <p class="text-gray-700 font-extrabold">Authorized Ledger Auditor Signature</p>
        </div>
    </div>

</body>
</html>
