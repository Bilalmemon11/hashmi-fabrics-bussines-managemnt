@extends('layouts.app')

@section('content')
<div class="space-y-8">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-black text-white tracking-tight">SHOP MAINTENANCE EXPENSES</h2>
            <p class="text-xs text-textMuted font-medium">Record utility bills, tea expenses, labor payouts, and daily operational costs</p>
        </div>
        <button onclick="toggleAddExpenseModal(true)" class="bg-brand hover:bg-brand/95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Record New Expense
        </button>
    </div>

    <!-- Expense logs table -->
    <div class="bg-cardBg border border-borderBg rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-borderBg flex justify-between items-center">
            <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Expense Register Logs</h3>
            <span class="bg-brand/10 text-brand px-2.5 py-0.5 rounded text-[10px] font-bold">Total Recorded: {{ count($expenses) }}</span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-borderBg/10 text-textMuted font-bold border-b border-borderBg/50">
                    <tr>
                        <th class="p-4">Expense Category</th>
                        <th class="p-4">Logged Date</th>
                        <th class="p-4">Memo Notes</th>
                        <th class="p-4 text-right">Amount (Rs)</th>
                        <th class="p-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-borderBg/30">
                    @forelse($expenses as $exp)
                        <tr class="hover:bg-borderBg/5 transition-colors">
                            <td class="p-4 font-bold text-white text-sm">
                                <span class="bg-[#1c2233] border border-borderBg px-3 py-1 rounded-lg">
                                    {{ $exp->category }}
                                </span>
                            </td>
                            <td class="p-4 font-mono text-textMuted">{{ $exp->date }}</td>
                            <td class="p-4 text-textMuted font-medium">{{ $exp->notes ?? 'Standard shop operating cost' }}</td>
                            <td class="p-4 text-right font-extrabold text-sm font-mono text-red-400">
                                Rs. {{ number_format($exp->amount, 2) }}
                            </td>
                            <td class="p-4 text-center">
                                <form action="{{ route('expenses.destroy', $exp->id) }}" method="POST" onsubmit="return confirm('Delete this expense log?')" class="inline">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-textMuted hover:text-red-400 cursor-pointer transition-colors">
                                        <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="p-12 text-center text-textMuted italic">No expenses logged yet. Keep your cash flows transparent by logging shop expenditures!</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- MODAL: Record Expense -->
<div id="add-expense-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">Log New Expense</h3>
            <button onclick="toggleAddExpenseModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form action="{{ route('expenses.store') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Expense Category *</label>
                <select name="category" required class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                    <option value="Electricity Bill">Electricity Bill</option>
                    <option value="Labor/Stitcher Wages">Labor / Stitcher Wages</option>
                    <option value="Shop Rent">Shop Rent</option>
                    <option value="Tea & Refreshments">Tea & Refreshments</option>
                    <option value="Fabric Carriage Freight">Fabric Carriage Freight</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Amount (Rs) *</label>
                    <input type="number" name="amount" required min="1" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono font-bold text-red-400">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Logged Date *</label>
                    <input type="date" name="date" required value="{{ date('Y-m-d') }}" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Memo Notes</label>
                <input type="text" name="notes" placeholder="e.g. Paid tea charges to canteen" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
            </div>

            <button type="submit" class="w-full bg-brand hover:bg-brand/95 text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-4">
                Record Expense Log
            </button>
        </form>
    </div>
</div>

<script>
    function toggleAddExpenseModal(show) {
        document.getElementById('add-expense-modal').classList.toggle('hidden', !show);
    }
</script>
@endsection
