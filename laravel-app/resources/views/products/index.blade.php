@extends('layouts.app')

@section('content')
<div class="space-y-8">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-black text-white tracking-tight">FABRICS PRODUCT INVENTORY</h2>
            <p class="text-xs text-textMuted font-medium">Control catalog prices, fabric dimensions, purchase costs, and real-time stocks</p>
        </div>
        <button onclick="toggleAddProductModal(true)" class="bg-brand hover:bg-brand/95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Add New Fabric
        </button>
    </div>

    <!-- Inventory table list -->
    <div class="bg-cardBg border border-borderBg rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-borderBg flex justify-between items-center">
            <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Fabric Catalog</h3>
            <span class="bg-brand/10 text-brand px-2.5 py-0.5 rounded text-[10px] font-bold">Total: {{ count($products) }} Types</span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-borderBg/10 text-textMuted font-bold border-b border-borderBg/50">
                    <tr>
                        <th class="p-4">Fabric Name / Title</th>
                        <th class="p-4">Category</th>
                        <th class="p-4">SKU Code</th>
                        <th class="p-4 text-right">Cost Price (COGS)</th>
                        <th class="p-4 text-right">Retail Sale Price</th>
                        <th class="p-4 text-right">Stock Quantity</th>
                        <th class="p-4 text-center">Modify</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-borderBg/30">
                    @forelse($products as $prod)
                        @php
                            $isLow = $prod->stock <= $prod->min_stock;
                        @endphp
                        <tr class="hover:bg-borderBg/5 transition-colors">
                            <td class="p-4 font-bold text-white text-sm">
                                <div class="flex items-center gap-2">
                                    {{ $prod->name }}
                                    @if($isLow)
                                        <span class="bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded">Low stock</span>
                                    @endif
                                </div>
                            </td>
                            <td class="p-4 text-textMuted uppercase font-semibold text-[10px]">{{ $prod->category ?? 'Cotton' }}</td>
                            <td class="p-4 font-mono text-textMuted">{{ $prod->sku ?? 'N/A' }}</td>
                            <td class="p-4 text-right font-bold text-textMuted font-mono">Rs. {{ number_format($prod->cost_price, 2) }}</td>
                            <td class="p-4 text-right font-bold text-brand font-mono text-sm">Rs. {{ number_format($prod->sale_price, 2) }}</td>
                            <td class="p-4 text-right font-extrabold font-mono text-sm {{ $isLow ? 'text-red-400' : 'text-white' }}">
                                {{ $prod->stock }} Met
                            </td>
                            <td class="p-4 text-center">
                                <button onclick="openEditProductModal({{ json_encode($prod) }})" class="bg-[#1c2233] hover:bg-[#2a3248] border border-borderBg text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer">
                                    Edit Params / Stock
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="p-12 text-center text-textMuted italic">No products added. Create catalog items to initialize Sales billing!</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- MODAL: Add Product -->
<div id="add-product-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">Add New Fabric</h3>
            <button onclick="toggleAddProductModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form action="{{ route('products.store') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Fabric Title *</label>
                <input type="text" name="name" required placeholder="e.g. Wash & Wear Soft Cotton" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Category</label>
                    <input type="text" name="category" placeholder="Cotton, Linen, Wash & Wear" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">SKU Code</label>
                    <input type="text" name="sku" placeholder="HF-WASH-123" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Purchase Price (COGS) *</label>
                    <input type="number" name="cost_price" required min="0" value="0" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Sales Retail Price *</label>
                    <input type="number" name="sale_price" required min="0" value="0" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Available Stock (Meters) *</label>
                    <input type="number" name="stock" required min="0" value="100" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Low Stock Limit *</label>
                    <input type="number" name="min_stock" required min="0" value="15" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono font-bold text-amber-400">
                </div>
            </div>

            <button type="submit" class="w-full bg-brand hover:bg-brand/95 text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-4">
                Create Catalog Entry
            </button>
        </form>
    </div>
</div>

<!-- MODAL: Edit Product -->
<div id="edit-product-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center z-50 p-4">
    <div class="bg-cardBg border border-borderBg rounded-2xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl">
        <div class="flex justify-between items-center border-b border-borderBg pb-4 mb-4">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">Modify Fabric Inventory</h3>
            <button onclick="toggleEditProductModal(false)" class="text-textMuted hover:text-white cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="edit-product-form" method="POST" class="space-y-4">
            @csrf
            @method('PUT')
            <div>
                <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Fabric Title *</label>
                <input type="text" id="edit-name-input" name="name" required class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Category</label>
                    <input type="text" id="edit-category-input" name="category" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">SKU Code</label>
                    <input type="text" id="edit-sku-input" name="sku" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Purchase Price (COGS) *</label>
                    <input type="number" id="edit-cost-input" name="cost_price" required min="0" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Sales Retail Price *</label>
                    <input type="number" id="edit-sale-input" name="sale_price" required min="0" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Available Stock (Meters) *</label>
                    <input type="number" id="edit-stock-input" name="stock" required min="0" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Low Stock Limit *</label>
                    <input type="number" id="edit-min-stock-input" name="min_stock" required min="0" class="w-full bg-[#0f1117] border border-borderBg rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand font-mono font-bold text-amber-400">
                </div>
            </div>

            <button type="submit" class="w-full bg-brand hover:bg-brand/95 text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-4">
                Modify Stock Parameters
            </button>
        </form>
    </div>
</div>

<script>
    function toggleAddProductModal(show) {
        document.getElementById('add-product-modal').classList.toggle('hidden', !show);
    }

    function openEditProductModal(prod) {
        document.getElementById('edit-name-input').value = prod.name;
        document.getElementById('edit-category-input').value = prod.category ? prod.category : '';
        document.getElementById('edit-sku-input').value = prod.sku ? prod.sku : '';
        document.getElementById('edit-cost-input').value = prod.cost_price;
        document.getElementById('edit-sale-input').value = prod.sale_price;
        document.getElementById('edit-stock-input').value = prod.stock;
        document.getElementById('edit-min-stock-input').value = prod.min_stock;

        // Dynamically configure update form action url
        var form = document.getElementById('edit-product-form');
        form.action = '/products/' + prod.id;

        toggleEditProductModal(true);
    }

    function toggleEditProductModal(show) {
        document.getElementById('edit-product-modal').classList.toggle('hidden', !show);
    }
</script>
@endsection
