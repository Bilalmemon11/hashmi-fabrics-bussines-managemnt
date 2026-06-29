@extends('layouts.app')

@section('content')
<div class="space-y-8">
    <!-- Header Page title -->
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-black text-white tracking-tight">DASHBOARD</h2>
            <p class="text-xs text-textMuted font-medium">Welcome back, Hashmi Fabrics Overview</p>
        </div>
        <div class="bg-cardBg border border-borderBg px-4 py-2 rounded-xl text-xs font-mono font-bold text-brand">
            Today: {{ date('d M, Y') }}
        </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Stat Card 1: Today's Sales -->
        <div class="bg-cardBg border border-borderBg p-6 rounded-2xl flex items-center justify-between">
            <div class="space-y-1">
                <span class="text-[10px] text-textMuted font-bold uppercase tracking-wider">Today's Sales</span>
                <p class="text-xl font-extrabold text-white font-mono">Rs. {{ number_format($todaySales, 2) }}</p>
            </div>
            <div class="p-3 bg-brand/10 text-brand rounded-xl">
                <i data-lucide="trending-up" class="w-5 h-5"></i>
            </div>
        </div>

        <!-- Stat Card 2: Today's Cash Inflow -->
        <div class="bg-cardBg border border-borderBg p-6 rounded-2xl flex items-center justify-between">
            <div class="space-y-1">
                <span class="text-[10px] text-textMuted font-bold uppercase tracking-wider">Today's Collections</span>
                <p class="text-xl font-extrabold text-emerald-400 font-mono">Rs. {{ number_format($todayReceived, 2) }}</p>
            </div>
            <div class="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <i data-lucide="dollar-sign" class="w-5 h-5"></i>
            </div>
        </div>

        <!-- Stat Card 3: Total Outstanding Udhar -->
        <div class="bg-cardBg border border-borderBg p-6 rounded-2xl flex items-center justify-between">
            <div class="space-y-1">
                <span class="text-[10px] text-textMuted font-bold uppercase tracking-wider">Customer Udhar</span>
                <p class="text-xl font-extrabold text-amber-400 font-mono">Rs. {{ number_format($totalUdharCustomer, 2) }}</p>
            </div>
            <div class="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <i data-lucide="wallet" class="w-5 h-5"></i>
            </div>
        </div>

        <!-- Stat Card 4: Supplier Payables -->
        <div class="bg-cardBg border border-borderBg p-6 rounded-2xl flex items-center justify-between">
            <div class="space-y-1">
                <span class="text-[10px] text-textMuted font-bold uppercase tracking-wider">Vendor Payables</span>
                <p class="text-xl font-extrabold text-red-400 font-mono">Rs. {{ number_format($totalPayableVendor, 2) }}</p>
            </div>
            <div class="p-3 bg-red-500/10 text-red-400 rounded-xl">
                <i data-lucide="arrow-up-right" class="w-5 h-5"></i>
            </div>
        </div>
    </div>

    <!-- Inventory Stock Alerts and Recent Invoices layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 1. Stock Alerts panel (2/3 width on large screen) -->
        <div class="bg-cardBg border border-borderBg rounded-2xl p-6 lg:col-span-1 flex flex-col space-y-4">
            <div class="flex items-center justify-between border-b border-borderBg pb-3">
                <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Stock Alerts</h3>
                <span class="bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded text-[10px] font-bold">Low Stock</span>
            </div>
            
            <div class="space-y-3 flex-grow overflow-y-auto max-h-[300px]">
                @forelse($lowStockProducts as $prod)
                    <div class="flex items-center justify-between p-3 bg-[#1c2233]/40 border border-borderBg/50 rounded-xl">
                        <div>
                            <p class="text-xs font-bold text-white">{{ $prod->name }}</p>
                            <p class="text-[10px] text-textMuted font-mono">SKU: {{ $prod->sku ?? 'N/A' }}</p>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-extrabold text-red-400 font-mono">{{ $prod->stock }} Met</span>
                            <span class="block text-[8px] text-textMuted">Min: {{ $prod->min_stock }}</span>
                        </div>
                    </div>
                @empty
                    <p class="text-xs text-textMuted italic py-8 text-center">All product stocks are stable!</p>
                @endforelse
            </div>
        </div>

        <!-- 2. Recent Invoices (2/3 width) -->
        <div class="bg-cardBg border border-borderBg rounded-2xl p-6 lg:col-span-2 flex flex-col space-y-4">
            <div class="flex items-center justify-between border-b border-borderBg pb-3">
                <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Recent Fabric Sales</h3>
                <a href="{{ route('invoices.index') }}" class="text-[10px] text-brand font-bold uppercase hover:underline">View All</a>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="text-textMuted font-bold border-b border-borderBg/50 pb-2">
                            <th class="pb-2">Invoice No</th>
                            <th class="pb-2">Customer</th>
                            <th class="pb-2">Type</th>
                            <th class="pb-2 text-right">Total Amount</th>
                            <th class="pb-2 text-right">Udhar Left</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-borderBg/30">
                        @forelse($recentInvoices as $inv)
                            <tr>
                                <td class="py-3 font-mono font-bold text-white">{{ $inv->invoice_no }}</td>
                                <td class="py-3 font-semibold text-white">{{ $inv->customer_name }}</td>
                                <td class="py-3 uppercase text-[10px] font-bold {{ $inv->payment_type == 'cash' ? 'text-emerald-400' : 'text-amber-400' }}">
                                    {{ $inv->payment_type }}
                                </td>
                                <td class="py-3 text-right font-bold text-white font-mono">Rs. {{ number_format($inv->total, 2) }}</td>
                                <td class="py-3 text-right font-bold font-mono {{ $inv->balance > 0 ? 'text-red-400' : 'text-emerald-400' }}">
                                    Rs. {{ number_format($inv->balance, 2) }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="py-8 text-center text-textMuted italic">No sales invoiced logged yet.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
