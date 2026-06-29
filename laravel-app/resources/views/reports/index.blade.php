@extends('layouts.app')

@section('content')
<div class="space-y-8">
    <!-- Top headers and date filters -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 class="text-2xl font-black text-white tracking-tight">PROFIT & LOSS STATEMENT</h2>
            <p class="text-xs text-textMuted font-medium">Analyze revenue, fabric cost ratios, operating expenses, and net profit indices</p>
        </div>
        
        <!-- Period Filter Form -->
        <form action="{{ route('reports.index') }}" method="GET" class="bg-cardBg border border-borderBg p-3 rounded-2xl flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
            <div class="flex items-center gap-2">
                <span class="text-[10px] uppercase font-bold text-textMuted">From:</span>
                <input type="date" name="start_date" value="{{ $startDate }}" class="bg-[#0f1117] border border-borderBg/70 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-brand">
            </div>
            <div class="flex items-center gap-2">
                <span class="text-[10px] uppercase font-bold text-textMuted">To:</span>
                <input type="date" name="end_date" value="{{ $endDate }}" class="bg-[#0f1117] border border-borderBg/70 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-brand">
            </div>
            <button type="submit" class="bg-brand hover:bg-brand/95 text-white font-semibold px-4 py-1.5 rounded-lg transition-all cursor-pointer">
                Filter Range
            </button>
        </form>
    </div>

    <!-- P&L Calculation Sheet Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 1. The main statement spreadsheet (2/3 width) -->
        <div class="bg-cardBg border border-borderBg rounded-2xl p-6 lg:col-span-2 space-y-6">
            <div class="border-b border-borderBg pb-3 flex justify-between items-center">
                <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Statement of Accounts</h3>
                <span class="text-[10px] font-mono font-bold text-brand">{{ $startDate }} to {{ $endDate }}</span>
            </div>

            <div class="space-y-4 text-xs">
                <!-- Section 1: Revenue -->
                <div class="space-y-2">
                    <div class="flex justify-between font-bold text-white text-sm">
                        <span class="uppercase tracking-wider">I. REVENUE</span>
                        <span class="font-mono">Rs. {{ number_format($totalSales, 2) }}</span>
                    </div>
                    <div class="pl-4 flex justify-between text-textMuted">
                        <span>Gross Invoiced Sales:</span>
                        <span class="font-mono">Rs. {{ number_format($totalSales, 2) }}</span>
                    </div>
                </div>

                <hr class="border-borderBg/40" />

                <!-- Section 2: Cost of Sales -->
                <div class="space-y-2">
                    <div class="flex justify-between font-bold text-white text-sm">
                        <span class="uppercase tracking-wider">II. COST OF GOODS SOLD (COGS)</span>
                        <span class="font-mono text-red-400">- Rs. {{ number_format($cogs, 2) }}</span>
                    </div>
                    <div class="pl-4 flex justify-between text-textMuted">
                        <span>Original Fabric Carriage & Purchase Costs:</span>
                        <span class="font-mono">Rs. {{ number_format($cogs, 2) }}</span>
                    </div>
                </div>

                <!-- Section 3: Gross Profit Margin -->
                <div class="bg-[#1c2233]/40 p-4 border border-borderBg rounded-xl flex justify-between font-extrabold text-white text-sm">
                    <span class="uppercase tracking-wider text-brand">GROSS PROFIT MARGIN (I - II)</span>
                    <span class="font-mono">Rs. {{ number_format($grossProfit, 2) }}</span>
                </div>

                <!-- Section 4: Operating Expenses -->
                <div class="space-y-2">
                    <div class="flex justify-between font-bold text-white text-sm">
                        <span class="uppercase tracking-wider">III. OPERATING EXPENSES (OPEX)</span>
                        <span class="font-mono text-red-400">- Rs. {{ number_format($totalExpenses, 2) }}</span>
                    </div>
                    <div class="pl-4 flex justify-between text-textMuted">
                        <span>Shop maintenance, tea charges, utilities & freight:</span>
                        <span class="font-mono">Rs. {{ number_format($totalExpenses, 2) }}</span>
                    </div>
                </div>

                <hr class="border-borderBg/40" />

                <!-- Section 5: Net Profit or Loss -->
                <div class="p-4 rounded-xl flex justify-between font-black text-white text-base {{ $netProfit >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400' }}">
                    <span class="uppercase tracking-widest">{{ $netProfit >= 0 ? 'NET INCOME / PROFIT' : 'NET OPERATING LOSS' }}</span>
                    <span class="font-mono font-black">Rs. {{ number_format($netProfit, 2) }}</span>
                </div>
            </div>
        </div>

        <!-- 2. Auxiliary Cash Flow ledger insights (1/3 width) -->
        <div class="bg-cardBg border border-borderBg rounded-2xl p-6 space-y-4 flex flex-col">
            <div class="border-b border-borderBg pb-3">
                <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Cash Flow Index</h3>
            </div>

            <p class="text-xs text-textMuted">This index displays supplementary direct payments processed inside the database during this range (independent of direct invoice sales payments):</p>
            
            <div class="space-y-3 flex-grow pt-2">
                <!-- Stat: Udhar received today -->
                <div class="p-4 bg-[#0f1117] rounded-xl border border-borderBg/40 flex justify-between items-center text-xs">
                    <div>
                        <span class="text-textMuted block">Dues Collected from Customers:</span>
                        <span class="text-sm font-extrabold text-emerald-400 font-mono mt-1 block">Rs. {{ number_format($directUdharPayments, 2) }}</span>
                    </div>
                    <div class="text-emerald-400/10 text-emerald-400 p-2 rounded-lg bg-emerald-500/10">
                        <i data-lucide="arrow-down-left" class="w-4 h-4"></i>
                    </div>
                </div>

                <!-- Stat: Dues paid to suppliers -->
                <div class="p-4 bg-[#0f1117] rounded-xl border border-borderBg/40 flex justify-between items-center text-xs">
                    <div>
                        <span class="text-textMuted block">Dues Disbursed to Supplier Mills:</span>
                        <span class="text-sm font-extrabold text-blue-400 font-mono mt-1 block">Rs. {{ number_format($paymentsToSuppliers, 2) }}</span>
                    </div>
                    <div class="text-blue-400/10 text-blue-400 p-2 rounded-lg bg-blue-500/10">
                        <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-brand/5 p-4 rounded-xl border border-brand/20 text-[10px] text-textMuted">
                <p class="font-bold text-white uppercase mb-1">Financial Compliance</p>
                Calculations are system-generated and verified mathematically based on strict double-entry ledger constraints.
            </div>
        </div>
    </div>
</div>
@endsection
