@extends('layouts.app')

@section('content')
<div class="space-y-8">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-black text-white tracking-tight">SALES INVOICES</h2>
            <p class="text-xs text-textMuted font-medium">Generate fabrics wholesale/retail receipts, calculate dynamic tax/discounts, and handle payments</p>
        </div>
        <button onclick="toggleNewInvoiceModal(true)" class="bg-brand hover:bg-brand/95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Generate New Invoice
        </button>
    </div>

    <!-- Invoices List -->
    <div class="bg-cardBg border border-borderBg rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-borderBg flex justify-between items-center">
            <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Invoiced Sales Ledger</h3>
            <span class="bg-brand/10 text-brand px-2.5 py-0.5 rounded text-[10px] font-bold">Total Invoices: {{ count($invoices) }}</span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-borderBg/10 text-textMuted font-bold border-b border-borderBg/50">
                    <tr>
                        <th class="p-4">Invoice No</th>
                        <th class="p-4">Date</th>
                        <th class="p-4">Client Name</th>
                        <th class="p-4">Settlement</th>
                        <th class="p-4 text-right">Subtotal</th>
                        <th class="p-4 text-right">Discount</th>
                        <th class="p-4 text-right">Total Due</th>
                        <th class="p-4 text-right font-bold text-emerald-400">Paid Amount</th>
                        <th class="p-4 text-right font-bold text-amber-400">Udhar Balance</th>
                        <th class="p-4 text-center">Print Receipts</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-borderBg/30">
                    @forelse($invoices as $inv)
                        <tr class="hover:bg-borderBg/5 transition-colors">
                            <td class="p-4 font-mono font-bold text-white text-sm">{{ $inv->invoice_no }}</td>
                            <td class="p-4 font-mono text-textMuted">{{ $inv->date }}</td>
                            <td class="p-4 font-semibold text-white">
                                {{ $inv->customer_name }}
                                @if($inv->customer_phone)
                                    <span class="block text-[10px] text-textMuted font-mono font-normal">{{ $inv->customer_phone }}</span>
                                @endif
                            </td>
                            <td class="p-4">
                                <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase {{ $inv->payment_type == 'cash' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400' }}">
                                    {{ $inv->payment_type }}
                                </span>
                            </td>
                            <td class="p-4 text-right font-mono text-textMuted">Rs. {{ number_format($inv->subtotal, 2) }}</td>
                            <td class="p-4 text-right font-mono text-emerald-400">Rs. {{ number_format($inv->discount, 2) }}</td>
                            <td class="p-4 text-right font-mono font-extrabold text-white">Rs. {{ number_format($inv->total, 2) }}</td>
                            <td class="p-4 text-right font-mono font-bold text-emerald-400">Rs. {{ number_format($inv->paid, 2) }}</td>
                            <td class="p-4 text-right font-mono font-bold {{ $inv->balance > 0 ? 'text-red-400' : 'text-emerald-400' }}">
                                Rs. {{ number_format($inv->balance, 2) }}
                            </td>
                            <td class="p-4 text-center">
                                <a href="{{ route('invoices.print', $inv->id) }}" target="_blank" class="bg-brand/10 hover:bg-brand text-brand hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer">
                                    <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print / Save PDF
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="10" class="p-12 text-center text-textMuted italic">No invoice sheets processed yet. Tap "Generate New Invoice" to bill custom fabrics!</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- MODAL: Generate New Invoice (Full Screen Sidebar Wizard style) -->
<div id="new-invoice-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-4xl p-6 overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <div>
                <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">Generate Sales Receipt & Settle Ledger</h3>
                <p class="text-[10px] text-textMuted mt-0.5">Processes inventory deductions and calculates outstanding dues automatically</p>
            </div>
            <button onclick="toggleNewInvoiceModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form action="{{ route('invoices.store') }}" method="POST" class="space-y-4 overflow-y-auto pr-2 flex-grow">
            @csrf
            
            <!-- Metadata inputs -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Select Customer Account *</label>
                    <select name="customer_id" required class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                        <option value="">-- Choose Customer --</option>
                        @foreach($customers as $c)
                            <option value="{{ $c->id }}">{{ $c->name }} (Udhar: Rs. {{ number_format($c->balance) }})</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Billing Date *</label>
                    <input type="date" name="date" required value="{{ date('Y-m-d') }}" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Payment Method / Base *</label>
                    <select id="payment_type" name="payment_type" onchange="handlePaymentTypeChange()" required class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-bold text-brand uppercase">
                        <option value="cash">Full Cash (No Udhar)</option>
                        <option value="credit">Partial Credit / Udhar</option>
                    </select>
                </div>
            </div>

            <!-- Dynamic Line Items Rows Section -->
            <div class="space-y-3">
                <div class="flex justify-between items-center border-t border-borderBg pt-4">
                    <span class="text-[10px] font-bold text-textMuted uppercase tracking-wider">Line Items (Fabrics Description)</span>
                    <button type="button" onclick="addNewItemRow()" class="bg-[#1c2233] hover:bg-[#2a3248] border border-borderBg text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1">
                        <i data-lucide="plus" class="w-3.5 h-3.5 text-brand"></i> Add Row
                    </button>
                </div>

                <div class="bg-[#0f1117] border border-borderBg rounded-xl overflow-hidden">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-[#1c2233] text-textMuted font-bold border-b border-borderBg/50">
                            <tr>
                                <th class="p-3 pl-4">Fabric / Product Name</th>
                                <th class="p-3 text-center w-24">Qty / Met</th>
                                <th class="p-3 text-right w-36">Unit Price (Rs)</th>
                                <th class="p-3 text-right w-36 pr-4">Total Price (Rs)</th>
                                <th class="p-3 text-center w-16">Remove</th>
                            </tr>
                        </thead>
                        <tbody id="line-items-tbody">
                            <!-- Populated with rows dynamically via JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Pricing calculation totals block -->
            <div class="border-t border-borderBg pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <p class="text-[10px] text-textMuted font-bold uppercase tracking-wider">System Information:</p>
                    <div class="bg-[#0f1117]/80 rounded-xl p-3 border border-borderBg text-[11px] text-textMuted space-y-1">
                        <p>1. Stocks subtraction operates in real-time upon processing.</p>
                        <p>2. Unpaid amount (Total Due - Amount Paid) shifts instantly to customer balance ledger.</p>
                    </div>
                </div>

                <div class="bg-[#161b27]/80 border border-borderBg p-4 rounded-xl space-y-3 text-xs">
                    <div class="flex justify-between text-textMuted">
                        <span>Gross Subtotal:</span>
                        <span id="label-subtotal" class="font-mono font-bold">Rs. 0.00</span>
                    </div>

                    <div class="grid grid-cols-2 gap-3 items-center">
                        <label class="text-textMuted">Special Discount (Rs):</label>
                        <input type="number" id="discount-input" name="discount" value="0" min="0" oninput="calculateInvoicingTotals()" class="bg-[#0f1117] border border-borderBg rounded-lg px-2.5 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-brand">
                    </div>

                    <div class="flex justify-between border-t border-borderBg/40 pt-2 text-white font-extrabold text-sm">
                        <span>Final Bill Total:</span>
                        <span id="label-total" class="font-mono text-brand">Rs. 0.00</span>
                    </div>

                    <div class="grid grid-cols-2 gap-3 items-center">
                        <label class="text-emerald-400 font-bold">Amount Paid (Rs):</label>
                        <input type="number" id="paid-input" name="paid" value="0" min="0" oninput="calculateInvoicingTotals()" class="bg-[#0f1117] border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white text-right font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500">
                    </div>

                    <div class="flex justify-between border-t border-borderBg/30 pt-2 text-red-400 font-bold text-sm">
                        <span>Outstanding Udhar:</span>
                        <span id="label-balance" class="font-mono">Rs. 0.00</span>
                    </div>
                </div>
            </div>

            <button type="submit" class="w-full bg-brand hover:bg-brand/95 text-white py-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-4 flex items-center justify-center gap-2">
                <i data-lucide="printer" class="w-4 h-4"></i> Save Sales Invoice Ledger & Auto-Print PDF
            </button>
        </form>
    </div>
</div>

<script>
    var productCatalog = {!! json_encode($products) !!};
    var rowIndex = 0;

    function toggleNewInvoiceModal(show) {
        document.getElementById('new-invoice-modal').classList.toggle('hidden', !show);
        if (show && rowIndex === 0) {
            addNewItemRow();
        }
    }

    function addNewItemRow() {
        var tbody = document.getElementById('line-items-tbody');
        var tr = document.createElement('tr');
        tr.id = 'row-' + rowIndex;
        tr.className = 'border-b border-borderBg/20 hover:bg-borderBg/5';

        var selectOptions = '<option value="">-- Select Fabric --</option>';
        productCatalog.forEach(function(p) {
            selectOptions += `<option value="${p.id}" data-price="${p.sale_price}" data-stock="${p.stock}">${p.name} (Stock: ${p.stock}m | Rs. ${p.sale_price})</option>`;
        });

        tr.innerHTML = `
            <td class="p-3 pl-4">
                <select name="items[${rowIndex}][product_id]" required onchange="handleProductChange(${rowIndex}, this)" class="w-full bg-[#0f1117] border border-borderBg/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand">
                    ${selectOptions}
                </select>
            </td>
            <td class="p-3 text-center">
                <input type="number" name="items[${rowIndex}][qty]" required min="1" value="1" oninput="calculateRowTotal(${rowIndex})" class="row-qty w-full bg-[#0f1117] border border-borderBg/60 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-brand">
            </td>
            <td class="p-3 text-right">
                <input type="number" name="items[${rowIndex}][unit_price]" required min="0" value="0" oninput="calculateRowTotal(${rowIndex})" class="row-price w-full bg-[#0f1117] border border-borderBg/60 rounded-lg px-2 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-brand">
            </td>
            <td class="p-3 text-right pr-4 font-bold text-white font-mono row-total" id="row-total-${rowIndex}">
                Rs. 0.00
            </td>
            <td class="p-3 text-center">
                <button type="button" onclick="removeRow(${rowIndex})" class="text-textMuted hover:text-red-400 cursor-pointer p-1 rounded-lg hover:bg-red-500/10"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        `;

        tbody.appendChild(tr);
        lucide.createIcons();
        rowIndex++;
    }

    function removeRow(idx) {
        var row = document.getElementById('row-' + idx);
        if (row) {
            row.remove();
        }
        calculateInvoicingTotals();
    }

    function handleProductChange(idx, selectEl) {
        var option = selectEl.options[selectEl.selectedIndex];
        var price = option.getAttribute('data-price') || 0;
        var stock = option.getAttribute('data-stock') || 0;
        
        var row = document.getElementById('row-' + idx);
        var priceInput = row.querySelector('input[name="items[' + idx + '][unit_price]"]');
        var qtyInput = row.querySelector('input[name="items[' + idx + '][qty]"]');

        priceInput.value = price;
        qtyInput.max = stock;

        calculateRowTotal(idx);
    }

    function calculateRowTotal(idx) {
        var row = document.getElementById('row-' + idx);
        var price = parseFloat(row.querySelector('input[name="items[' + idx + '][unit_price]"]').value) || 0;
        var qty = parseFloat(row.querySelector('input[name="items[' + idx + '][qty]"]').value) || 0;

        var total = price * qty;
        document.getElementById('row-total-' + idx).textContent = 'Rs. ' + total.toLocaleString(undefined, {minimumFractionDigits: 2});
        
        calculateInvoicingTotals();
    }

    function calculateInvoicingTotals() {
        var subtotal = 0;
        var totals = document.querySelectorAll('.row-total');
        
        // Loop over rows and compute sum
        var lineQty = document.querySelectorAll('.row-qty');
        var linePrice = document.querySelectorAll('.row-price');

        for (var i = 0; i < lineQty.length; i++) {
            var q = parseFloat(lineQty[i].value) || 0;
            var p = parseFloat(linePrice[i].value) || 0;
            subtotal += (q * p);
        }

        var discount = parseFloat(document.getElementById('discount-input').value) || 0;
        var finalTotal = Math.max(0, subtotal - discount);
        
        var paymentType = document.getElementById('payment_type').value;
        var paidInput = document.getElementById('paid-input');

        if (paymentType === 'cash') {
            paidInput.value = finalTotal;
            paidInput.readOnly = true;
        } else {
            paidInput.readOnly = false;
        }

        var paid = parseFloat(paidInput.value) || 0;
        var outstanding = Math.max(0, finalTotal - paid);

        document.getElementById('label-subtotal').textContent = 'Rs. ' + subtotal.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('label-total').textContent = 'Rs. ' + finalTotal.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('label-balance').textContent = 'Rs. ' + outstanding.toLocaleString(undefined, {minimumFractionDigits: 2});
    }

    function handlePaymentTypeChange() {
        var type = document.getElementById('payment_type').value;
        var paidInput = document.getElementById('paid-input');

        if (type === 'cash') {
            paidInput.readOnly = true;
        } else {
            paidInput.readOnly = false;
        }
        calculateInvoicingTotals();
    }
</script>
@endsection
