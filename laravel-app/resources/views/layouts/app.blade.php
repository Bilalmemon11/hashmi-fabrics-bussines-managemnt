<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hashmi Fabrics Business Suite</title>
    <!-- Tailwind CSS Play CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0f1117;
            color: #e8eaf0;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        /* Custom scrollbars */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0f1117;
        }
        ::-webkit-scrollbar-thumb {
            background: #2a3248;
            border-radius: 4px;
        }
        @media print {
            .no-print {
                display: none !important;
            }
            body {
                background: white !important;
                color: black !important;
            }
        }
    </style>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: '#6c63ff',
                        darkBg: '#0f1117',
                        cardBg: '#161b27',
                        borderBg: '#2a3248',
                        textMuted: '#8892a4',
                    }
                }
            }
        }
    </script>
</head>
<body class="flex h-screen overflow-hidden">

    <!-- 1. Left Navigation Sidebar -->
    <aside class="w-64 bg-cardBg border-r border-borderBg flex flex-col justify-between no-print">
        <div class="flex flex-col flex-grow">
            <!-- Brand Logo -->
            <div class="p-6 border-b border-borderBg flex items-center gap-3">
                <div class="bg-brand/10 text-brand p-2 rounded-lg">
                    <i data-lucide="layers" class="w-6 h-6"></i>
                </div>
                <div>
                    <h1 class="font-extrabold text-white tracking-tight uppercase text-sm">Hashmi Fabrics</h1>
                    <span class="text-[10px] text-brand font-bold tracking-wider uppercase">Business Suite</span>
                </div>
            </div>

            <!-- Navigation Links -->
            <nav class="p-4 space-y-1.5 flex-grow overflow-y-auto">
                <a href="{{ route('dashboard') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold {{ request()->routeIs('dashboard') ? 'bg-brand text-white' : 'text-textMuted hover:bg-[#1c2233] hover:text-white' }} transition-all">
                    <i data-lucide="layout-dashboard" class="w-4 h-4"></i> Dashboard
                </a>
                <a href="{{ route('invoices.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold {{ request()->routeIs('invoices.*') ? 'bg-brand text-white' : 'text-textMuted hover:bg-[#1c2233] hover:text-white' }} transition-all">
                    <i data-lucide="file-text" class="w-4 h-4"></i> Sales Invoices
                </a>
                <a href="{{ route('customers.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold {{ request()->routeIs('customers.*') ? 'bg-brand text-white' : 'text-textMuted hover:bg-[#1c2233] hover:text-white' }} transition-all">
                    <i data-lucide="users" class="w-4 h-4"></i> Customer Ledgers
                </a>
                <a href="{{ route('products.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold {{ request()->routeIs('products.*') ? 'bg-brand text-white' : 'text-textMuted hover:bg-[#1c2233] hover:text-white' }} transition-all">
                    <i data-lucide="package" class="w-4 h-4"></i> Products Inventory
                </a>
                <a href="{{ route('vendors.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold {{ request()->routeIs('vendors.*') ? 'bg-brand text-white' : 'text-textMuted hover:bg-[#1c2233] hover:text-white' }} transition-all">
                    <i data-lucide="truck" class="w-4 h-4"></i> Supplier Mills
                </a>
                <a href="{{ route('expenses.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold {{ request()->routeIs('expenses.*') ? 'bg-brand text-white' : 'text-textMuted hover:bg-[#1c2233] hover:text-white' }} transition-all">
                    <i data-lucide="credit-card" class="w-4 h-4"></i> Shop Expenses
                </a>
                <a href="{{ route('reports.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold {{ request()->routeIs('reports.*') ? 'bg-brand text-white' : 'text-textMuted hover:bg-[#1c2233] hover:text-white' }} transition-all">
                    <i data-lucide="bar-chart-3" class="w-4 h-4"></i> Reports & P&L
                </a>
            </nav>
        </div>

        <!-- Footer Credits -->
        <div class="p-4 border-t border-borderBg text-center text-[10px] text-textMuted">
            <p>© 2026 Hashmi Fabrics</p>
            <p class="font-mono text-[9px] mt-1">Laravel Core v10</p>
        </div>
    </aside>

    <!-- 2. Main content container -->
    <main class="flex-grow flex flex-col overflow-hidden relative">
        <!-- Top bar -->
        <header class="h-16 border-b border-borderBg bg-cardBg/30 flex items-center justify-between px-8 no-print z-10">
            <div class="flex items-center gap-4">
                <span class="text-xs text-textMuted font-mono">Server Status: <span class="text-green-400">● Live</span></span>
            </div>
            <div class="flex items-center gap-3">
                <div class="text-right">
                    <p class="text-xs font-bold text-white">Administrator</p>
                    <p class="text-[10px] text-brand">Faisalabad Branch</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-brand/15 text-brand flex items-center justify-center font-bold text-xs uppercase border border-brand/20">
                    HF
                </div>
            </div>
        </header>

        <!-- Dynamic Content Stage -->
        <div class="flex-grow p-8 overflow-y-auto no-print">
            
            <!-- Session Alert notifications -->
            @if(session('success'))
                <div class="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs font-medium">
                    <i data-lucide="check-circle" class="w-4 h-4 flex-shrink-0"></i>
                    <span>{{ session('success') }}</span>
                </div>
            @endif

            @if(session('error'))
                <div class="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-xs font-medium">
                    <i data-lucide="alert-triangle" class="w-4 h-4 flex-shrink-0"></i>
                    <span>{{ session('error') }}</span>
                </div>
            @endif

            @yield('content')
        </div>
    </main>

    <!-- Hidden Printer Frame or Dynamic Popup print helpers -->
    @if(session('print_invoice_id'))
        <script>
            window.addEventListener('load', function() {
                var printUrl = "{{ route('invoices.print', session('print_invoice_id')) }}";
                var printWin = window.open(printUrl, '_blank', 'width=800,height=600');
                if (printWin) {
                    printWin.addEventListener('load', function() {
                        printWin.focus();
                        printWin.print();
                    });
                }
            });
        </script>
    @endif

    @if(session('print_payment_id'))
        <script>
            window.addEventListener('load', function() {
                var printUrl = "{{ route('customers.print-payment', session('print_payment_id')) }}";
                var printWin = window.open(printUrl, '_blank', 'width=800,height=600');
                if (printWin) {
                    printWin.addEventListener('load', function() {
                        printWin.focus();
                        printWin.print();
                    });
                }
            });
        </script>
    @endif

    @if(session('print_vendor_payment_id'))
        <script>
            window.addEventListener('load', function() {
                var printUrl = "{{ route('vendors.print-payment', session('print_vendor_payment_id')) }}";
                var printWin = window.open(printUrl, '_blank', 'width=800,height=600');
                if (printWin) {
                    printWin.addEventListener('load', function() {
                        printWin.focus();
                        printWin.print();
                    });
                }
            });
        </script>
    @endif

    <!-- Load Lucide icons -->
    <script>
        lucide.createIcons();
    </script>
</body>
</html>
