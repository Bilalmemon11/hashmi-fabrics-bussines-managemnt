<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Invoice - {{ $invoice->invoice_no }}</title>
    <!-- Tailwind CDN for basic styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            color: #000000;
            background: #ffffff;
        }
        @media print {
            html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 10px;
                font-size: 11px !important;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body class="p-8 max-w-4xl mx-auto">

    <!-- Top print actions bar (hidden during print) -->
    <div class="no-print mb-6 flex justify-between items-center bg-gray-100 p-4 rounded-xl border border-gray-200">
        <span class="text-xs text-gray-600 font-bold">Print Preview — Laser/A4 Format Layout</span>
        <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1">
            Print Now / Save as PDF
        </button>
    </div>

    <!-- Header Invoice Branding -->
    <div class="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
            <h1 class="text-3xl font-black uppercase tracking-tight">Hashmi Fabrics</h1>
            <p class="text-xs font-bold text-gray-700 mt-1">Mill Directory, Wholesale & Retail Fabrics Stockist</p>
            <p class="text-[10px] text-gray-500 mt-0.5">Faisalabad, Pakistan • Phone: 0300-1234567 • Email: info@hashmifabrics.com</p>
        </div>
        <div class="text-right">
            <span class="inline-block bg-black text-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider">Sales Invoice</span>
            <p class="text-[10px] text-gray-600 mt-2 font-mono">Printed: {{ date('d-M-Y h:i A') }}</p>
        </div>
    </div>

    <!-- Info Metadata block -->
    <div class="grid grid-cols-2 gap-6 text-xs mb-6">
        <div class="border border-gray-300 p-3 rounded">
            <span class="text-gray-500 font-bold uppercase text-[9px] block mb-1">Bill To Customer:</span>
            <p class="font-extrabold text-sm text-black">{{ $invoice->customer_name }}</p>
            @if($invoice->customer_phone)
                <p class="text-gray-600 mt-1 font-mono">Phone: {{ $invoice->customer_phone }}</p>
            @endif
        </div>
        <div class="border border-gray-300 p-3 rounded grid grid-cols-2 gap-2">
            <div>
                <span class="text-gray-500 font-bold uppercase text-[9px] block">Invoice No:</span>
                <p class="font-bold text-black font-mono">{{ $invoice->invoice_no }}</p>
            </div>
            <div>
                <span class="text-gray-500 font-bold uppercase text-[9px] block">Billing Date:</span>
                <p class="font-bold text-black font-mono">{{ $invoice->date }}</p>
            </div>
            <div>
                <span class="text-gray-500 font-bold uppercase text-[9px] block">Payment Type:</span>
                <p class="font-bold text-black uppercase font-mono">{{ $invoice->payment_type }}</p>
            </div>
            <div>
                <span class="text-gray-500 font-bold uppercase text-[9px] block">Settlement status:</span>
                <p class="font-bold uppercase font-mono {{ $invoice->balance > 0 ? 'text-red-600' : 'text-green-600' }}">
                    {{ $invoice->balance > 0 ? 'Udhar / Credit' : 'Fully Settled' }}
                </p>
            </div>
        </div>
    </div>

    <!-- Fabrics Table list -->
    <div class="mb-6">
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="bg-gray-100 border-t border-b border-black font-bold uppercase text-[10px]">
                    <th class="py-2 px-3 w-12">#</th>
                    <th class="py-2 px-3">Fabric / Product Description</th>
                    <th class="py-2 px-3 text-center w-24">Qty / Meters</th>
                    <th class="py-2 px-3 text-right w-36">Unit Price</th>
                    <th class="py-2 px-3 text-right w-36 pr-4">Total Price</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 border-b border-black">
                @foreach($invoice->items as $idx => $item)
                    <tr>
                        <td class="py-2.5 px-3 font-mono text-gray-500">{{ $idx + 1 }}</td>
                        <td class="py-2.5 px-3 font-bold text-black">{{ $item->product_name }}</td>
                        <td class="py-2.5 px-3 text-center font-mono">{{ $item->qty }}</td>
                        <td class="py-2.5 px-3 text-right font-mono">Rs. {{ number_format($item->unit_price, 2) }}</td>
                        <td class="py-2.5 px-3 text-right font-bold font-mono pr-4">Rs. {{ number_format($item->total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Financial breakdowns panel -->
    <div class="flex justify-end mb-12">
        <div class="w-1/2 border border-black rounded p-4 space-y-2 text-xs bg-gray-50/50">
            <div class="flex justify-between text-gray-600 font-mono">
                <span>Gross Subtotal:</span>
                <span>Rs. {{ number_format($invoice->subtotal, 2) }}</span>
            </div>
            @if($invoice->discount > 0)
                <div class="flex justify-between text-green-700 font-bold font-mono">
                    <span>Special Discount:</span>
                    <span>- Rs. {{ number_format($invoice->discount, 2) }}</span>
                </div>
            @endif
            <hr class="border-gray-400" />
            <div class="flex justify-between text-black font-black text-sm font-mono">
                <span>Total Bill Amount:</span>
                <span>Rs. {{ number_format($invoice->total, 2) }}</span>
            </div>
            <div class="flex justify-between text-green-700 font-extrabold font-mono">
                <span>Amount Paid Today:</span>
                <span>Rs. {{ number_format($invoice->paid, 2) }}</span>
            </div>
            <hr class="border-gray-400" />
            <div class="flex justify-between text-red-600 font-black text-sm font-mono">
                <span>Outstanding Udhar:</span>
                <span>Rs. {{ number_format($invoice->balance, 2) }}</span>
            </div>
        </div>
    </div>

    <!-- Footer authorized credentials -->
    <div class="mt-16 pt-4 border-t border-gray-300 flex justify-between items-end text-[10px] text-gray-400">
        <div>
            <p class="font-bold text-gray-700 uppercase">System-Generated Document</p>
            <p class="text-gray-500">Processed using Hashmi Fabrics Business Management Suite.</p>
        </div>
        <div class="text-right w-1/3 border-t border-dashed border-gray-400 pt-6">
            <p class="text-gray-700 font-extrabold">Authorized Signature & Stamp</p>
        </div>
    </div>

</body>
</html>
