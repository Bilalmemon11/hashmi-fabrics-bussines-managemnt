@extends('layouts.app')

@section('content')
<div class="space-y-8">
    <!-- Top action headers -->
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-black text-white tracking-tight">SUPPLIER MILL LEDGERS</h2>
            <p class="text-xs text-textMuted font-medium">Manage wholesale vendors, purchase accounts and outwards payment clearances</p>
        </div>
        <button onclick="toggleAddVendorModal(true)" class="bg-brand hover:bg-brand/95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Create Supplier Ledger
        </button>
    </div>

    <!-- Active Vendors Table -->
    <div class="bg-cardBg border border-borderBg rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-borderBg flex justify-between items-center">
            <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Mill Accounts</h3>
            <span class="bg-brand/10 text-brand px-2.5 py-0.5 rounded text-[10px] font-bold">Total: {{ count($vendors) }}</span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-borderBg/10 text-textMuted font-bold border-b border-borderBg/50">
                    <tr>
                        <th class="p-4">Vendor / Mill Name</th>
                        <th class="p-4">Mill Company</th>
                        <th class="p-4">Contact Phone</th>
                        <th class="p-4">City</th>
                        <th class="p-4 text-right">Outstanding Payable</th>
                        <th class="p-4 text-center">Settlements</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-borderBg/30">
                    @forelse($vendors as $vend)
                        <tr class="hover:bg-borderBg/5 transition-colors">
                            <td class="p-4 font-bold text-white text-sm">{{ $vend->name }}</td>
                            <td class="p-4 font-semibold text-[#a78bfa]">{{ $vend->company ?? 'Mill Stockist' }}</td>
                            <td class="p-4 font-mono text-textMuted">{{ $vend->phone ?? 'N/A' }}</td>
                            <td class="p-4 text-textMuted font-medium">{{ $vend->city ?? 'Faisalabad' }}</td>
                            <td class="p-4 text-right font-extrabold text-sm font-mono {{ $vend->balance > 0 ? 'text-amber-400' : 'text-emerald-400' }}">
                                Rs. {{ number_format($vend->balance, 2) }}
                            </td>
                            <td class="p-4 flex gap-2 justify-center">
                                @if($vend->balance > 0)
                                    <button onclick="openPayVendorModal({{ $vend->id }}, '{{ $vend->name }}', {{ $vend->balance }})" class="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1">
                                        <i data-lucide="hand-coins" class="w-3.5 h-3.5"></i> Settle Outwards Payment
                                    </button>
                                @endif
                                <button onclick="openLedgerModal({{ json_encode($vend) }})" class="bg-[#1c2233] hover:bg-[#2a3248] border border-borderBg text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1">
                                    <i data-lucide="eye" class="w-3.5 h-3.5"></i> Settle Ledger
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="p-12 text-center text-textMuted italic">No supplier mill accounts registered. Add a vendor to track wholesale purchases and payables!</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- MODAL: Add Vendor Ledger -->
<div id="add-vendor-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">Register Supplier Ledger</h3>
            <button onclick="toggleAddVendorModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form action="{{ route('vendors.store') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Supplier Representative Name *</label>
                <input type="text" name="name" required class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Mill / Company Name</label>
                    <input type="text" name="company" placeholder="e.g. Hashmi Mill" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Representative Phone</label>
                    <input type="text" name="phone" placeholder="0300-1234567" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">City / Hub</label>
                    <input type="text" name="city" placeholder="Faisalabad" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Initial Payable Dues (Rs)</label>
                    <input type="number" name="balance" value="0" min="0" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
            </div>

            <button type="submit" class="w-full bg-brand hover:bg-brand/95 text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-4">
                Register Supplier Ledger
            </button>
        </form>
    </div>
</div>

<!-- MODAL: Pay Vendor -->
<div id="pay-vendor-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">Settle Outwards Payment</h3>
            <button onclick="togglePayVendorModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="pay-vendor-form" method="POST" class="space-y-4">
            @csrf
            <div>
                <p class="text-xs text-textMuted">Disbursing cash towards outstanding dues of:</p>
                <p id="pay-target-vendor" class="text-sm font-extrabold text-white mt-0.5"></p>
                <div class="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg text-xs font-mono mt-2 flex justify-between">
                    <span>Payable Dues Remaining:</span>
                    <span id="pay-target-balance" class="font-extrabold"></span>
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Paid Amount (Rs) *</label>
                <input type="number" id="pay-amount-input" name="amount" required min="1" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono font-bold text-brand">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Payment Date *</label>
                    <input type="date" name="date" required value="{{ date('Y-m-d') }}" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Memo / Reference No</label>
                    <input type="text" name="notes" placeholder="Cash, Cheque No, Bank Slip" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                </div>
            </div>

            <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-4 flex items-center justify-center gap-2">
                <i data-lucide="printer" class="w-4 h-4"></i> Pay & Auto-Print Voucher PDF
            </button>
        </form>
    </div>
</div>

<!-- MODAL: View Vendor Payments History & Ledger -->
<div id="view-ledger-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-2xl p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <div>
                <h3 id="ledger-title" class="text-sm font-extrabold text-white uppercase tracking-wider">Supplier Settlement Ledger</h3>
                <p id="ledger-subtitle" class="text-[10px] text-textMuted mt-0.5 font-semibold"></p>
            </div>
            <button onclick="toggleLedgerModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <div class="space-y-4">
            <div class="bg-[#0f1117] rounded-xl border border-borderBg/60 p-4 flex justify-between items-center text-xs">
                <div>
                    <span class="text-textMuted block">Total Outstanding Payables:</span>
                    <span id="ledger-current-balance" class="text-base font-extrabold text-amber-400 font-mono"></span>
                </div>
                <div class="text-right">
                    <span class="text-textMuted block">Mill Reference:</span>
                    <span id="ledger-vendor-company" class="text-xs font-extrabold uppercase text-brand"></span>
                </div>
            </div>

            <!-- Payments history table -->
            <div class="space-y-2">
                <span class="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Historical Outwards Payments Paid</span>
                <div class="bg-[#1c2233]/40 border border-borderBg rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-[#1c2233] text-textMuted font-bold border-b border-borderBg/50">
                            <tr>
                                <th class="p-2.5 pl-4">Payment Date</th>
                                <th class="p-2.5">Reference / Notes</th>
                                <th class="p-2.5 text-right pr-4">Amount Settled</th>
                                <th class="p-2.5 text-center">Print Voucher</th>
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
                    <i data-lucide="file-down" class="w-4 h-4"></i> Print Full Supplier Ledger PDF
                </button>
                <button onclick="toggleLedgerModal(false)" class="flex-grow bg-[#1c2233] hover:bg-[#2a3248] border border-borderBg text-white py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                    Close Ledger Statement
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    var currentActiveVendor = null;

    function toggleAddVendorModal(show) {
        document.getElementById('add-vendor-modal').classList.toggle('hidden', !show);
    }

    function openPayVendorModal(id, name, balance) {
        document.getElementById('pay-target-vendor').textContent = name;
        document.getElementById('pay-target-balance').textContent = 'Rs. ' + Number(balance).toLocaleString();
        document.getElementById('pay-amount-input').max = balance;
        document.getElementById('pay-amount-input').value = balance;
        
        var form = document.getElementById('pay-vendor-form');
        form.action = '/vendors/' + id + '/pay';
        
        togglePayVendorModal(true);
    }

    function togglePayVendorModal(show) {
        document.getElementById('pay-vendor-modal').classList.toggle('hidden', !show);
    }

    function openLedgerModal(vendor) {
        currentActiveVendor = vendor;
        
        document.getElementById('ledger-title').textContent = vendor.name + ' Ledger';
        document.getElementById('ledger-subtitle').textContent = 'Phone: ' + (vendor.phone ? vendor.phone : 'N/A') + ' | ' + (vendor.city ? vendor.city : 'Faisalabad');
        document.getElementById('ledger-current-balance').textContent = 'Rs. ' + Number(vendor.balance).toLocaleString();
        document.getElementById('ledger-vendor-company').textContent = vendor.company ? vendor.company : 'Direct Supplier';

        var tbody = document.getElementById('ledger-payments-tbody');
        tbody.innerHTML = '';

        if (vendor.payments && vendor.payments.length > 0) {
            vendor.payments.forEach(function(pay) {
                var tr = document.createElement('tr');
                tr.className = 'hover:bg-borderBg/10';
                
                var formattedAmount = 'Rs. ' + Number(pay.amount).toLocaleString();
                var formattedDate = pay.date;
                var notes = pay.notes ? pay.notes : 'Supplier Cash Settle';

                tr.innerHTML = `
                    <td class="p-2.5 pl-4 font-mono">${formattedDate}</td>
                    <td class="p-2.5 text-textMuted">${notes}</td>
                    <td class="p-2.5 text-right font-bold text-blue-400 font-mono pr-4">${formattedAmount}</td>
                    <td class="p-2.5 text-center">
                        <a href="/vendors/payments/${pay.id}/print" target="_blank" class="inline-block bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white p-1 rounded transition-all">
                            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                        </a>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-textMuted italic">No payments disbursed in ledger history.</td></tr>';
        }

        lucide.createIcons();
        toggleLedgerModal(true);
    }

    function toggleLedgerModal(show) {
        document.getElementById('view-ledger-modal').classList.toggle('hidden', !show);
    }

    function printCompleteLedger() {
        if (!currentActiveVendor) return;
        
        if (currentActiveVendor.payments && currentActiveVendor.payments.length > 0) {
            var lastPayId = currentActiveVendor.payments[currentActiveVendor.payments.length - 1].id;
            window.open('/vendors/payments/' + lastPayId + '/print', '_blank');
        } else {
            alert("No cash out vouchers logged yet to compile supplier statement!");
        }
    }
</script>
@endsection
