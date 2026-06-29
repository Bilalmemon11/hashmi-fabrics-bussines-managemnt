@extends('layouts.app')

@section('content')
<div class="space-y-8">
    <!-- Top actions bar -->
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-black text-white tracking-tight">CUSTOMER ACCOUNT LEDGERS</h2>
            <p class="text-xs text-textMuted font-medium">Manage customer profiles, receivables (Udhar) and payments</p>
        </div>
        <!-- Button to open add customer section/modal -->
        <button onclick="toggleAddCustomerModal(true)" class="bg-brand hover:bg-brand/95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Create Account Ledger
        </button>
    </div>

    <!-- Main Customers Table Grid -->
    <div class="bg-cardBg border border-borderBg rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-borderBg flex justify-between items-center">
            <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Active Customers</h3>
            <span class="bg-brand/10 text-brand px-2.5 py-0.5 rounded text-[10px] font-bold">Total: {{ count($customers) }}</span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-borderBg/10 text-textMuted font-bold border-b border-borderBg/50">
                    <tr>
                        <th class="p-4">Customer Name</th>
                        <th class="p-4">Contact Info</th>
                        <th class="p-4">City</th>
                        <th class="p-4">Client Class</th>
                        <th class="p-4 text-right">Outstanding Udhar</th>
                        <th class="p-4 text-center">Actions / Settlements</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-borderBg/30">
                    @forelse($customers as $cust)
                        <tr class="hover:bg-borderBg/5 transition-colors">
                            <td class="p-4 font-bold text-white text-sm">{{ $cust->name }}</td>
                            <td class="p-4 font-mono text-textMuted">{{ $cust->phone ?? 'No Phone' }}</td>
                            <td class="p-4 text-textMuted font-medium">{{ $cust->city ?? 'Faisalabad' }}</td>
                            <td class="p-4">
                                <span class="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase {{ $cust->type == 'wholesale' ? 'bg-[#a78bfa]/10 text-[#a78bfa]' : 'bg-brand/10 text-brand' }}">
                                    {{ $cust->type }}
                                </span>
                            </td>
                            <td class="p-4 text-right font-extrabold text-sm font-mono {{ $cust->balance > 0 ? 'text-red-400' : 'text-emerald-400' }}">
                                Rs. {{ number_format($cust->balance, 2) }}
                            </td>
                            <td class="p-4 flex gap-2 justify-center">
                                @if($cust->balance > 0)
                                    <button onclick="openReceivePaymentModal({{ $cust->id }}, '{{ $cust->name }}', {{ $cust->balance }})" class="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1">
                                        <i data-lucide="hand-coins" class="w-3.5 h-3.5"></i> Receive Money
                                    </button>
                                @endif
                                <button onclick="openLedgerModal({{ json_encode($cust) }})" class="bg-[#1c2233] hover:bg-[#2a3248] border border-borderBg text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1">
                                    <i data-lucide="eye" class="w-3.5 h-3.5"></i> Ledger History
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="p-12 text-center text-textMuted italic">No customers registered yet. Create one to begin billing and credit ledger!</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- MODAL: Add Customer Ledger -->
<div id="add-customer-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">Create Account Ledger</h3>
            <button onclick="toggleAddCustomerModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form action="{{ route('customers.store') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Customer / Shop Name *</label>
                <input type="text" name="name" required class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Phone Number</label>
                    <input type="text" name="phone" placeholder="e.g. 0300-1234567" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">City / Region</label>
                    <input type="text" name="city" placeholder="Faisalabad" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Client Category *</label>
                    <select name="type" required class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                        <option value="retail">Retail Client</option>
                        <option value="wholesale">Wholesale Buyer</option>
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Initial Udhar Balance (Rs)</label>
                    <input type="number" name="balance" value="0" min="0" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
            </div>

            <button type="submit" class="w-full bg-brand hover:bg-brand/95 text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-4">
                Register Customer Ledger
            </button>
        </form>
    </div>
</div>

<!-- MODAL: Receive Payment -->
<div id="receive-payment-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">Receive Udhar Deposit</h3>
            <button onclick="toggleReceivePaymentModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="receive-payment-form" method="POST" class="space-y-4">
            @csrf
            <div>
                <p class="text-xs text-textMuted">Depositing towards outstanding Udhar of:</p>
                <p id="payment-target-customer" class="text-sm font-extrabold text-white mt-0.5"></p>
                <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-mono mt-2 flex justify-between">
                    <span>Current Outstanding:</span>
                    <span id="payment-target-balance" class="font-extrabold"></span>
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Deposit Amount (Rs) *</label>
                <input type="number" id="deposit-amount-input" name="amount" required min="1" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Deposit Date *</label>
                    <input type="date" name="date" required value="{{ date('Y-m-d') }}" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Memo / Note</label>
                    <input type="text" name="notes" placeholder="e.g. Cash, Bank" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                </div>
            </div>

            <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-4 flex items-center justify-center gap-2">
                <i data-lucide="printer" class="w-4 h-4"></i> Process & Auto-Print PDF
            </button>
        </form>
    </div>
</div>

<!-- MODAL: View Historical Ledger & Print Statements -->
<div id="view-ledger-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-2xl p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <div>
                <h3 id="ledger-title" class="text-sm font-extrabold text-white uppercase tracking-wider">Customer Ledger Statement</h3>
                <p id="ledger-subtitle" class="text-[10px] text-textMuted mt-0.5 font-semibold"></p>
            </div>
            <button onclick="toggleLedgerModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <div class="space-y-4">
            <div class="bg-[#0f1117] rounded-xl border border-borderBg/60 p-4 flex justify-between items-center text-xs">
                <div>
                    <span class="text-textMuted block">Total Receivables Outstanding:</span>
                    <span id="ledger-current-balance" class="text-base font-extrabold text-red-400 font-mono"></span>
                </div>
                <div class="text-right">
                    <span class="text-textMuted block">Account Category:</span>
                    <span id="ledger-customer-type" class="text-xs font-extrabold uppercase text-brand"></span>
                </div>
            </div>

            <!-- Ledger Payments Table -->
            <div class="space-y-2">
                <span class="text-[10px] font-bold text-textMuted uppercase tracking-wider block">All Payments Received History</span>
                <div class="bg-[#1c2233]/40 border border-borderBg rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-[#1c2233] text-textMuted font-bold border-b border-borderBg/50">
                            <tr>
                                <th class="p-2.5 pl-4">Payment Date</th>
                                <th class="p-2.5">Reference / Notes</th>
                                <th class="p-2.5 text-right pr-4">Amount Paid</th>
                                <th class="p-2.5 text-center">Print Slip</th>
                            </tr>
                        </thead>
                        <tbody id="ledger-payments-tbody" class="divide-y divide-borderBg/30">
                            <!-- Populated dynamically via JS -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="flex gap-3 pt-2">
                <button type="button" onclick="printCompleteLedger()" class="flex-grow bg-brand hover:bg-brand/95 text-white py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <i data-lucide="file-down" class="w-4 h-4"></i> Print Full Statement PDF
                </button>
                <button onclick="toggleLedgerModal(false)" class="flex-grow bg-[#1c2233] hover:bg-[#2a3248] border border-borderBg text-white py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                    Close Ledger Statement
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    var currentActiveCustomer = null;

    function toggleAddCustomerModal(show) {
        document.getElementById('add-customer-modal').classList.toggle('hidden', !show);
    }

    function openReceivePaymentModal(id, name, balance) {
        document.getElementById('payment-target-customer').textContent = name;
        document.getElementById('payment-target-balance').textContent = 'Rs. ' + Number(balance).toLocaleString();
        document.getElementById('deposit-amount-input').max = balance;
        document.getElementById('deposit-amount-input').value = balance;
        
        // Dynamically update form action url
        var form = document.getElementById('receive-payment-form');
        form.action = '/customers/' + id + '/receive-payment';
        
        toggleReceivePaymentModal(true);
    }

    function toggleReceivePaymentModal(show) {
        document.getElementById('receive-payment-modal').classList.toggle('hidden', !show);
    }

    function openLedgerModal(customer) {
        currentActiveCustomer = customer;
        
        document.getElementById('ledger-title').textContent = customer.name + ' Ledger';
        document.getElementById('ledger-subtitle').textContent = 'Phone: ' + (customer.phone ? customer.phone : 'N/A') + ' | ' + (customer.city ? customer.city : 'Faisalabad');
        document.getElementById('ledger-current-balance').textContent = 'Rs. ' + Number(customer.balance).toLocaleString();
        document.getElementById('ledger-customer-type').textContent = customer.type;

        var tbody = document.getElementById('ledger-payments-tbody');
        tbody.innerHTML = '';

        if (customer.payments && customer.payments.length > 0) {
            customer.payments.forEach(function(pay) {
                var tr = document.createElement('tr');
                tr.className = 'hover:bg-borderBg/10';
                
                var formattedAmount = 'Rs. ' + Number(pay.amount).toLocaleString();
                var formattedDate = pay.date;
                var notes = pay.notes ? pay.notes : 'Direct Cash Settlement';

                tr.innerHTML = `
                    <td class="p-2.5 pl-4 font-mono">${formattedDate}</td>
                    <td class="p-2.5 text-textMuted">${notes}</td>
                    <td class="p-2.5 text-right font-bold text-emerald-400 font-mono pr-4">${formattedAmount}</td>
                    <td class="p-2.5 text-center">
                        <a href="/customers/payments/${pay.id}/print" target="_blank" class="inline-block bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white p-1 rounded transition-all">
                            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                        </a>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-textMuted italic">No payments deposited in ledger history.</td></tr>';
        }

        lucide.createIcons();
        toggleLedgerModal(true);
    }

    function toggleLedgerModal(show) {
        document.getElementById('view-ledger-modal').classList.toggle('hidden', !show);
    }

    function printCompleteLedger() {
        if (!currentActiveCustomer) return;
        
        // Open the print receipt URL for the last registered payment if any, or general profile
        if (currentActiveCustomer.payments && currentActiveCustomer.payments.length > 0) {
            var lastPayId = currentActiveCustomer.payments[currentActiveCustomer.payments.length - 1].id;
            window.open('/customers/payments/' + lastPayId + '/print', '_blank');
        } else {
            alert("No cash receipts logged to print dynamic statement! Outstanding balance can be viewed inside Invoices.");
        }
    }
</script>
@endsection
