// HASHMI FABRICS BUSINESS SUITE - MAIN APPLICATION CONTROLLER (VANILLA JS)

// --- GLOBAL STATE ---
let state = {
  products: [],
  customers: [],
  vendors: [],
  invoices: [],
  expenses: [],
  activeTab: "dashboard",
};

// --- BASE API URL ---
const API_PREFIX = "/api/v1";

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  updateTime();
  setInterval(updateTime, 1000);
  loadAllData();
});

// --- CLOCK CONTROLLER ---
function updateTime() {
  const timeSpan = document.getElementById("current-time");
  if (timeSpan) {
    const now = new Date();
    // Format to YYYY-MM-DD HH:MM:SS
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    timeSpan.textContent = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }
}

// --- TAB ROUTING ---
function setupNavigation() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tab = btn.getAttribute("data-tab");
      switchTab(tab);
    });
  });
}

function switchTab(tabName) {
  state.activeTab = tabName;

  // Update active sidebar buttons styling
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    const btnTab = btn.getAttribute("data-tab");
    if (btnTab === tabName) {
      btn.className = "tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-200 text-emerald-400 bg-slate-800/80";
    } else {
      btn.className = "tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-200 text-slate-400 hover:text-white hover:bg-slate-800";
    }
  });

  // Set topbar title
  const titleMap = {
    dashboard: "Dashboard",
    customers: "Customer Ledgers & Receipts",
    vendors: "Supplier Mills (Vendors)",
    products: "Fabric Inventory Catalog",
    invoices: "Fabric Billing & Invoices",
    expenses: "Shop Operating Expenses",
    reports: "Profit & Loss / Reports",
    laravel: "Laravel & MySQL Database Export",
  };
  document.getElementById("current-page-title").textContent = titleMap[tabName] || "Suite";

  // Trigger content render
  renderActiveView();
}

// --- GLOBAL TOAST NOTIFICATION ---
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  const toastIcon = document.getElementById("toast-icon");

  if (!toast) return;

  toastMsg.textContent = message;
  if (isError) {
    toast.className = "fixed bottom-5 right-5 transform translate-y-0 opacity-100 transition duration-300 bg-red-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50";
    toastIcon.setAttribute("data-lucide", "alert-circle");
  } else {
    toast.className = "fixed bottom-5 right-5 transform translate-y-0 opacity-100 transition duration-300 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-800 flex items-center gap-2 z-50";
    toastIcon.setAttribute("data-lucide", "check-circle");
  }

  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.className = "fixed bottom-5 right-5 transform translate-y-10 opacity-0 pointer-events-none transition duration-300 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-800 flex items-center gap-2 z-50";
  }, 3000);
}

// --- SERVER API CALL CONTAINER ---
async function apiCall(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_PREFIX}${endpoint}`, options);
    const result = await res.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || "Failed API transaction");
    }
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    showToast(error.message, true);
    return null;
  }
}

// --- BULK FETCH DATA ON INIT ---
async function loadAllData() {
  const contentArea = document.getElementById("content-area");
  contentArea.innerHTML = `
    <div class="flex items-center justify-center h-64 text-gray-500">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p>Fetching real-time ledger records from server...</p>
      </div>
    </div>
  `;

  const products = await apiCall("/products");
  const customers = await apiCall("/customers");
  const vendors = await apiCall("/vendors");
  const invoices = await apiCall("/invoices");
  const expenses = await apiCall("/expenses");

  if (products) state.products = products;
  if (customers) state.customers = customers;
  if (vendors) state.vendors = vendors;
  if (invoices) state.invoices = invoices;
  if (expenses) state.expenses = expenses;

  renderActiveView();
}

// --- DYNAMIC VIEW DISPATCHER ---
function renderActiveView() {
  const contentArea = document.getElementById("content-area");
  if (!contentArea) return;

  switch (state.activeTab) {
    case "dashboard":
      renderDashboard(contentArea);
      break;
    case "customers":
      renderCustomers(contentArea);
      break;
    case "vendors":
      renderVendors(contentArea);
      break;
    case "products":
      renderProducts(contentArea);
      break;
    case "invoices":
      renderInvoices(contentArea);
      break;
    case "expenses":
      renderExpenses(contentArea);
      break;
    case "reports":
      renderReports(contentArea);
      break;
    case "laravel":
      renderLaravel(contentArea);
      break;
    default:
      contentArea.innerHTML = `<p class="text-center text-gray-500">View not found.</p>`;
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ====================================================================
// 1. DASHBOARD MODULE
// ====================================================================
function renderDashboard(container) {
  // Compute Stats
  const totalSales = state.invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const totalReceived = state.invoices.reduce((sum, inv) => sum + Number(inv.paid), 0);
  const customerReceivables = state.customers.reduce((sum, cust) => sum + Number(cust.balance), 0);
  const vendorPayables = state.vendors.reduce((sum, vend) => sum + Number(vend.balance), 0);
  const totalExpenses = state.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Filter low stock
  const lowStock = state.products.filter(p => p.stock_qty <= p.reorder_level);

  container.innerHTML = `
    <!-- Upper Grid Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      
      <!-- Card 1: Total Sales -->
      <div class="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-5">
        <div class="p-4 bg-emerald-50 rounded-xl text-emerald-600">
          <i data-lucide="trending-up" class="w-6 h-6"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Sales</p>
          <h3 class="text-2xl font-bold mt-1 text-gray-800">Rs. ${totalSales.toLocaleString()}</h3>
          <p class="text-[10px] text-gray-500 mt-1">Cash In: Rs. ${totalReceived.toLocaleString()}</p>
        </div>
      </div>

      <!-- Card 2: Customer Receivables -->
      <div class="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-5">
        <div class="p-4 bg-blue-50 rounded-xl text-blue-600">
          <i data-lucide="hand-coins" class="w-6 h-6"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Customer Receivables</p>
          <h3 class="text-2xl font-bold mt-1 text-gray-800">Rs. ${customerReceivables.toLocaleString()}</h3>
          <p class="text-[10px] text-blue-500 mt-1 font-medium">To be collected</p>
        </div>
      </div>

      <!-- Card 3: Vendor Payables -->
      <div class="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-5">
        <div class="p-4 bg-rose-50 rounded-xl text-rose-600">
          <i data-lucide="landmark" class="w-6 h-6"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Vendor Payables</p>
          <h3 class="text-2xl font-bold mt-1 text-gray-800">Rs. ${vendorPayables.toLocaleString()}</h3>
          <p class="text-[10px] text-rose-500 mt-1 font-medium">To be paid to mills</p>
        </div>
      </div>

      <!-- Card 4: Operating Expenses -->
      <div class="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-5">
        <div class="p-4 bg-amber-50 rounded-xl text-amber-600">
          <i data-lucide="wallet" class="w-6 h-6"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Shop Expenses</p>
          <h3 class="text-2xl font-bold mt-1 text-gray-800">Rs. ${totalExpenses.toLocaleString()}</h3>
          <p class="text-[10px] text-gray-500 mt-1">Rent, wages, bills</p>
        </div>
      </div>

    </div>

    <!-- Alert and Activity Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Low Stock Alert -->
      <div class="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm lg:col-span-1">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <h4 class="font-bold text-gray-800 flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>
            Low Stock Alerts
          </h4>
          <span class="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold font-mono">${lowStock.length} Items</span>
        </div>
        <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
          ${lowStock.length === 0 ? `
            <div class="text-center py-8 text-gray-400 text-sm">
              <i data-lucide="check-circle-2" class="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50"></i>
              All fabrics healthy stock
            </div>
          ` : lowStock.map(p => `
            <div class="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
              <div>
                <h5 class="text-xs font-semibold text-gray-800">${p.name}</h5>
                <p class="text-[10px] text-gray-500 font-medium mt-0.5">Cat: ${p.category} | Limit: ${p.reorder_level} ${p.unit}</p>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-red-600 block">${p.stock_qty} ${p.unit}</span>
                <span class="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">CRITICAL</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Recent Transactions Activity -->
      <div class="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm lg:col-span-2">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <h4 class="font-bold text-gray-800 flex items-center gap-2">
            <i data-lucide="history" class="w-5 h-5 text-indigo-500"></i>
            Recent Fabric Billing Invoices
          </h4>
          <button onclick="switchTab('invoices')" class="text-emerald-600 hover:text-emerald-700 font-bold text-xs">View All &rarr;</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th class="pb-3">Invoice No</th>
                <th class="pb-3">Customer</th>
                <th class="pb-3">Date</th>
                <th class="pb-3 text-right">Grand Total</th>
                <th class="pb-3 text-right">Received</th>
                <th class="pb-3 text-center">Type</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-xs">
              ${state.invoices.slice(-6).reverse().map(inv => {
                const cust = state.customers.find(c => c.id === inv.customer_id) || { name: "Unknown" };
                const isCredit = inv.payment_type === "credit";
                return `
                  <tr class="hover:bg-gray-50/55 transition">
                    <td class="py-3.5 font-semibold text-gray-800 font-mono">${inv.invoice_no}</td>
                    <td class="py-3.5 text-gray-700 font-medium">${cust.name}</td>
                    <td class="py-3.5 text-gray-500">${inv.date}</td>
                    <td class="py-3.5 text-right font-bold text-gray-900">Rs. ${Number(inv.total).toLocaleString()}</td>
                    <td class="py-3.5 text-right text-emerald-600 font-semibold">Rs. ${Number(inv.paid).toLocaleString()}</td>
                    <td class="py-3.5 text-center">
                      <span class="px-2 py-0.5 rounded font-bold text-[9px] uppercase ${isCredit ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}">
                        ${inv.payment_type}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
              ${state.invoices.length === 0 ? `<tr><td colspan="6" class="text-center py-8 text-gray-400">No invoice billing generated yet.</td></tr>` : ""}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// ====================================================================
// 2. CUSTOMERS LEDGER MODULE
// ====================================================================
function renderCustomers(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3 w-1/3">
        <div class="relative w-full">
          <input type="text" id="cust-search" placeholder="Search customer by name or phone..." class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
          <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-3"></i>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="openAddCustomerModal()" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition duration-200">
          <i data-lucide="user-plus" class="w-4 h-4"></i> Add Customer
        </button>
      </div>
    </div>

    <!-- Customers Grid Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="p-4">Customer Name</th>
            <th class="p-4">Phone Number</th>
            <th class="p-4">Customer Type</th>
            <th class="p-4 text-right">Total Purchase</th>
            <th class="p-4 text-right">Balance Due (Receivable)</th>
            <th class="p-4 text-center">Transactions & Ledger</th>
          </tr>
        </thead>
        <tbody id="customers-list-body" class="divide-y divide-gray-100 text-xs text-gray-700">
          <!-- Populated dynamically -->
        </tbody>
      </table>
    </div>

    <!-- ADD CUSTOMER MODAL CONTAINER -->
    <div id="add-cust-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 class="font-bold text-sm">Register New Customer</h3>
          <button onclick="closeAddCustomerModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form id="add-cust-form" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Full Name <span class="text-red-500">*</span></label>
            <input type="text" id="cust-name" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
            <input type="text" id="cust-phone" placeholder="0300-1234567" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Account Classification</label>
            <select id="cust-type" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none">
              <option value="retail">Retail Buyer</option>
              <option value="wholesale">Wholesale Merchant</option>
            </select>
          </div>
          <div class="pt-2 flex justify-end gap-3">
            <button type="button" onclick="closeAddCustomerModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Add Customer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- CUSTOMER LEDGER MODAL -->
    <div id="cust-ledger-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl w-full max-w-4xl h-[80vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div class="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h3 class="font-bold text-sm" id="ledger-cust-title">Customer Ledger Details</h3>
            <p class="text-[10px] text-gray-400 mt-0.5" id="ledger-cust-meta"></p>
          </div>
          <button onclick="closeLedgerModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <div class="p-6 flex-1 overflow-y-auto space-y-6">
          
          <!-- Summary Balances Inside Ledger -->
          <div class="grid grid-cols-3 gap-6">
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200/50 text-center">
              <p class="text-[10px] font-bold text-gray-400 uppercase">Total Purchases</p>
              <h4 id="ledger-total-purchase" class="text-lg font-bold text-gray-800 mt-1">Rs. 0</h4>
            </div>
            <div class="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
              <p class="text-[10px] font-bold text-emerald-600 uppercase">Total Paid / Received</p>
              <h4 id="ledger-total-paid" class="text-lg font-bold text-emerald-800 mt-1">Rs. 0</h4>
            </div>
            <div class="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
              <p class="text-[10px] font-bold text-red-600 uppercase">Ledger Balance (Owes Us)</p>
              <h4 id="ledger-total-balance" class="text-lg font-bold text-red-800 mt-1">Rs. 0</h4>
            </div>
          </div>

          <!-- Transaction Listings -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-bold text-xs text-gray-500 uppercase tracking-wider">Statement of Accounts (Ledger entries)</h4>
              <button id="receive-pay-btn" class="bg-emerald-600 text-white px-3 py-1.5 rounded font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5">
                <i data-lucide="wallet" class="w-3.5 h-3.5"></i> Receive Payment
              </button>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <tr class="border-b border-gray-200">
                    <th class="p-3">Date</th>
                    <th class="p-3">Ref No / Details</th>
                    <th class="p-3 text-right">Debit (Sales)</th>
                    <th class="p-3 text-right">Credit (Receipts)</th>
                    <th class="p-3 text-right">Running Balance</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody id="ledger-table-body" class="divide-y divide-gray-100 text-xs">
                  <!-- dynamic rows -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RECEIVE PAYMENT MODAL -->
    <div id="receive-payment-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 class="font-bold text-sm">Log Payment Receipt</h3>
          <button onclick="closeReceivePaymentModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form id="receive-payment-form" class="p-6 space-y-4">
          <input type="hidden" id="pay-customer-id">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Paying Customer</label>
            <input type="text" id="pay-customer-name" readonly class="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Invoice Reference (Optional)</label>
            <select id="pay-invoice-id" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10">
              <option value="">General Account Payment</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Amount Received (PKR) <span class="text-red-500">*</span></label>
            <input type="number" id="pay-amount" min="1" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-semibold">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Date</label>
            <input type="date" id="pay-date" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
          </div>
          <div class="pt-2 flex justify-end gap-3">
            <button type="button" onclick="closeReceivePaymentModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Record Receipt</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Search filter setup
  const searchInput = document.getElementById("cust-search");
  searchInput.addEventListener("input", () => {
    populateCustomersList(searchInput.value.toLowerCase());
  });

  // Load the customers list initial body
  populateCustomersList();

  // Add customer modal form submit
  const form = document.getElementById("add-cust-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const type = document.getElementById("cust-type").value;

    const data = await apiCall("/customers", "POST", { name, phone, type });
    if (data) {
      showToast(`Successfully registered customer ${name}`);
      state.customers.push(data);
      closeAddCustomerModal();
      populateCustomersList();
    }
  });

  // Receive payment form submit
  const payForm = document.getElementById("receive-payment-form");
  payForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const customerId = document.getElementById("pay-customer-id").value;
    const amount = Number(document.getElementById("pay-amount").value);
    const date = document.getElementById("pay-date").value;
    const invoiceId = document.getElementById("pay-invoice-id").value;

    const data = await apiCall(`/customers/${customerId}/receive-payment`, "POST", {
      amount,
      date,
      invoice_id: invoiceId ? Number(invoiceId) : null
    });

    if (data) {
      showToast("Payment recorded and cash receipt printed!");
      
      // Update state locally
      const idx = state.customers.findIndex(c => c.id === Number(customerId));
      if (idx !== -1) {
        state.customers[idx].balance = Math.max(0, state.customers[idx].balance - amount);
      }

      // Re-load data to capture transaction history correctly
      loadAllData();
      closeReceivePaymentModal();
      closeLedgerModal();
      
      // Trigger printable receipt layout
      printPaymentReceipt(data, customerId);
    }
  });
}

function populateCustomersList(filter = "") {
  const tbody = document.getElementById("customers-list-body");
  if (!tbody) return;

  const filtered = state.customers.filter(c => 
    c.name.toLowerCase().includes(filter) || 
    (c.phone && c.phone.includes(filter))
  );

  tbody.innerHTML = filtered.map(c => `
    <tr class="hover:bg-gray-50/50 transition">
      <td class="p-4 font-semibold text-gray-800">${c.name}</td>
      <td class="p-4 text-gray-500 font-mono">${c.phone || "---"}</td>
      <td class="p-4 capitalize">
        <span class="px-2 py-0.5 rounded font-bold text-[9px] ${c.type === "wholesale" ? "bg-indigo-100 text-indigo-800" : "bg-teal-100 text-teal-800"}">
          ${c.type}
        </span>
      </td>
      <td class="p-4 text-right font-semibold">Rs. ${Number(c.total_purchase).toLocaleString()}</td>
      <td class="p-4 text-right font-bold ${c.balance > 0 ? "text-rose-600" : "text-emerald-600"}">Rs. ${Number(c.balance).toLocaleString()}</td>
      <td class="p-4 text-center">
        <div class="flex items-center justify-center gap-2">
          <button onclick="openLedgerModal(${c.id})" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 hover:border-indigo-200 px-3 py-1 rounded">
            View Statement
          </button>
          <button onclick="deleteCustomer(${c.id})" class="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-100 px-2 py-1 rounded hover:bg-red-100">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400">No customers found.</td></tr>`;
  }

  if (window.lucide) window.lucide.createIcons();
}

async function deleteCustomer(id) {
  if (confirm("Are you sure you want to delete this customer? This will clear their ledger history.")) {
    const data = await apiCall(`/customers/${id}`, "DELETE");
    if (data) {
      showToast("Customer deleted successfully!");
      state.customers = state.customers.filter(c => c.id !== id);
      populateCustomersList();
    }
  }
}

function openAddCustomerModal() {
  document.getElementById("add-cust-modal").classList.remove("hidden");
  document.getElementById("cust-name").focus();
}

function closeAddCustomerModal() {
  document.getElementById("add-cust-modal").classList.add("hidden");
  document.getElementById("add-cust-form").reset();
}

function openLedgerModal(id) {
  const customer = state.customers.find(c => c.id === id);
  if (!customer) return;

  document.getElementById("ledger-cust-title").textContent = `${customer.name} - Statement of Ledger`;
  document.getElementById("ledger-cust-meta").textContent = `Classification: ${customer.type.toUpperCase()} | Registered Account`;

  document.getElementById("ledger-total-purchase").textContent = `Rs. ${Number(customer.total_purchase).toLocaleString()}`;
  document.getElementById("ledger-total-balance").textContent = `Rs. ${Number(customer.balance).toLocaleString()}`;

  // Find all payments and invoices for this customer
  const custInvoices = state.invoices.filter(inv => inv.customer_id === id);
  // We can simulate payments ledger by looking at invoices that have been partially or fully paid, or general payments
  // In our local Express, invoices has total, paid, balance.
  const transactions = [];

  custInvoices.forEach(inv => {
    transactions.push({
      date: inv.date,
      ref: `Invoice ${inv.invoice_no}`,
      debit: inv.total,
      credit: 0,
      timestamp: new Date(inv.date).getTime()
    });
    if (inv.paid > 0) {
      transactions.push({
        date: inv.date,
        ref: `Payment Recv on Invoice ${inv.invoice_no}`,
        debit: 0,
        credit: inv.paid,
        timestamp: new Date(inv.date).getTime() + 10 // slightly ahead
      });
    }
  });

  // Sort transactions by date
  transactions.sort((a, b) => a.timestamp - b.timestamp);

  // Compute total paid
  const totalPaid = transactions.reduce((sum, t) => sum + t.credit, 0);
  document.getElementById("ledger-total-paid").textContent = `Rs. ${totalPaid.toLocaleString()}`;

  let runningBalance = 0;
  const tbody = document.getElementById("ledger-table-body");
  tbody.innerHTML = transactions.map(t => {
    runningBalance += t.debit - t.credit;
    return `
      <tr class="hover:bg-gray-50/50">
        <td class="p-3 text-gray-500 font-mono">${t.date}</td>
        <td class="p-3 font-medium text-gray-800">${t.ref}</td>
        <td class="p-3 text-right font-mono text-red-600 font-semibold">${t.debit > 0 ? "Rs. " + Number(t.debit).toLocaleString() : "---"}</td>
        <td class="p-3 text-right font-mono text-emerald-600 font-semibold">${t.credit > 0 ? "Rs. " + Number(t.credit).toLocaleString() : "---"}</td>
        <td class="p-3 text-right font-mono font-bold text-gray-900">Rs. ${runningBalance.toLocaleString()}</td>
        <td class="p-3 text-center">
          <button onclick="printLedgerItem('${t.ref}', ${t.debit || t.credit}, '${t.date}')" class="text-[10px] text-gray-500 hover:text-slate-900 font-bold bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
            <i data-lucide="printer" class="w-3.5 h-3.5 inline-block mr-1"></i> Print
          </button>
        </td>
      </tr>
    `;
  }).join("");

  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-400">No transactions recorded on ledger accounts.</td></tr>`;
  }

  // Setup the Receive Payment button for this customer
  const receiveBtn = document.getElementById("receive-pay-btn");
  receiveBtn.onclick = () => openReceivePaymentModal(id);

  document.getElementById("cust-ledger-modal").classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeLedgerModal() {
  document.getElementById("cust-ledger-modal").classList.add("hidden");
}

function openReceivePaymentModal(id) {
  const customer = state.customers.find(c => c.id === id);
  if (!customer) return;

  document.getElementById("pay-customer-id").value = id;
  document.getElementById("pay-customer-name").value = customer.name;
  document.getElementById("pay-amount").value = "";
  document.getElementById("pay-amount").max = customer.balance;
  document.getElementById("pay-date").value = new Date().toISOString().split("T")[0];

  // Fill active invoices dropdown
  const select = document.getElementById("pay-invoice-id");
  select.innerHTML = '<option value="">General Account Payment</option>';
  state.invoices.filter(inv => inv.customer_id === id && inv.balance > 0).forEach(inv => {
    select.innerHTML += `<option value="${inv.id}">Invoice ${inv.invoice_no} (Balance: Rs. ${Number(inv.balance).toLocaleString()})</option>`;
  });

  document.getElementById("receive-payment-modal").classList.remove("hidden");
  document.getElementById("pay-amount").focus();
}

function closeReceivePaymentModal() {
  document.getElementById("receive-payment-modal").classList.add("hidden");
}

// ====================================================================
// 3. SUPPLIER MILLS MODULE
// ====================================================================
function renderVendors(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3 w-1/3">
        <div class="relative w-full">
          <input type="text" id="vend-search" placeholder="Search suppliers by name or city..." class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
          <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-3"></i>
        </div>
      </div>
      <button onclick="openAddVendorModal()" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition duration-200">
        <i data-lucide="plus" class="w-4 h-4"></i> Add Supplier Mill
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="p-4">Supplier Mill</th>
            <th class="p-4">Phone</th>
            <th class="p-4">City</th>
            <th class="p-4 text-right">Total Purchases</th>
            <th class="p-4 text-right">Balance Outstanding (Payable)</th>
            <th class="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody id="vendors-list-body" class="divide-y divide-gray-100 text-xs text-gray-700">
          <!-- Dyn -->
        </tbody>
      </table>
    </div>

    <!-- ADD VENDOR MODAL -->
    <div id="add-vend-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 class="font-bold text-sm">Add New Supplier Mill</h3>
          <button onclick="closeAddVendorModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form id="add-vend-form" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Mill/Supplier Name <span class="text-red-500">*</span></label>
            <input type="text" id="vend-name" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
            <input type="text" id="vend-phone" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
            <input type="text" id="vend-city" placeholder="Faisalabad" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
          </div>
          <div class="pt-2 flex justify-end gap-3">
            <button type="button" onclick="closeAddVendorModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Save Vendor</button>
          </div>
        </form>
      </div>
    </div>

    <!-- LOG VENDOR PAYMENT MODAL -->
    <div id="log-vend-pay-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 class="font-bold text-sm">Issue Payment to Supplier Mill</h3>
          <button onclick="closeLogVendorPayModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form id="log-vend-pay-form" class="p-6 space-y-4">
          <input type="hidden" id="pay-vendor-id">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Supplier Mill</label>
            <input type="text" id="pay-vendor-name" readonly class="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Amount Paid (PKR) <span class="text-red-500">*</span></label>
            <input type="number" id="pay-vend-amount" min="1" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Payment</label>
            <input type="date" id="pay-vend-date" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Transaction Note (e.g. Bank Transfer details)</label>
            <input type="text" id="pay-vend-notes" placeholder="e.g. Allied Bank Chq #12345" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
          </div>
          <div class="pt-2 flex justify-end gap-3">
            <button type="button" onclick="closeLogVendorPayModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Log Payment</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const searchInput = document.getElementById("vend-search");
  searchInput.addEventListener("input", () => {
    populateVendorsList(searchInput.value.toLowerCase());
  });

  populateVendorsList();

  // Add vendor submit
  const form = document.getElementById("add-vend-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("vend-name").value;
    const phone = document.getElementById("vend-phone").value;
    const city = document.getElementById("vend-city").value;

    const data = await apiCall("/vendors", "POST", { name, phone, city });
    if (data) {
      showToast(`Supplier mill ${name} saved successfully.`);
      state.vendors.push(data);
      closeAddVendorModal();
      populateVendorsList();
    }
  });

  // Pay vendor submit
  const payForm = document.getElementById("log-vend-pay-form");
  payForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const vendorId = document.getElementById("pay-vendor-id").value;
    const amount = Number(document.getElementById("pay-vend-amount").value);
    const date = document.getElementById("pay-vend-date").value;
    const notes = document.getElementById("pay-vend-notes").value;

    const data = await apiCall(`/vendors/${vendorId}/pay`, "POST", { amount, date, notes });
    if (data) {
      showToast("Mill payment logged!");
      loadAllData();
      closeLogVendorPayModal();
    }
  });
}

function populateVendorsList(filter = "") {
  const tbody = document.getElementById("vendors-list-body");
  if (!tbody) return;

  const filtered = state.vendors.filter(v => 
    v.name.toLowerCase().includes(filter) || 
    (v.city && v.city.toLowerCase().includes(filter))
  );

  tbody.innerHTML = filtered.map(v => `
    <tr class="hover:bg-gray-50/50">
      <td class="p-4 font-semibold text-gray-800">${v.name}</td>
      <td class="p-4 text-gray-500 font-mono">${v.phone || "---"}</td>
      <td class="p-4 font-medium text-gray-600">${v.city || "---"}</td>
      <td class="p-4 text-right font-semibold">Rs. ${Number(v.total_purchase).toLocaleString()}</td>
      <td class="p-4 text-right font-bold text-rose-600">Rs. ${Number(v.balance).toLocaleString()}</td>
      <td class="p-4 text-center">
        <div class="flex items-center justify-center gap-2">
          <button onclick="openLogVendorPayModal(${v.id})" class="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-3 py-1 rounded text-xs hover:bg-emerald-100">
            Log Debit Pay
          </button>
          <button onclick="deleteVendor(${v.id})" class="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-100 px-2 py-1 rounded hover:bg-red-100">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400">No supplier mills found.</td></tr>`;
  }

  if (window.lucide) window.lucide.createIcons();
}

async function deleteVendor(id) {
  if (confirm("Are you sure you want to delete this vendor?")) {
    const data = await apiCall(`/vendors/${id}`, "DELETE");
    if (data) {
      showToast("Vendor deleted successfully.");
      state.vendors = state.vendors.filter(v => v.id !== id);
      populateVendorsList();
    }
  }
}

function openAddVendorModal() {
  document.getElementById("add-vend-modal").classList.remove("hidden");
  document.getElementById("vend-name").focus();
}

function closeAddCustomerModal() {
  document.getElementById("add-cust-modal").classList.add("hidden");
}

function closeAddVendorModal() {
  document.getElementById("add-vend-modal").classList.add("hidden");
  document.getElementById("add-vend-form").reset();
}

function openLogVendorPayModal(id) {
  const vendor = state.vendors.find(v => v.id === id);
  if (!vendor) return;

  document.getElementById("pay-vendor-id").value = id;
  document.getElementById("pay-vendor-name").value = vendor.name;
  document.getElementById("pay-vend-amount").value = "";
  document.getElementById("pay-vend-amount").max = vendor.balance;
  document.getElementById("pay-vend-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("pay-vend-notes").value = "";

  document.getElementById("log-vend-pay-modal").classList.remove("hidden");
  document.getElementById("pay-vend-amount").focus();
}

function closeLogVendorPayModal() {
  document.getElementById("log-vend-pay-modal").classList.add("hidden");
}

// ====================================================================
// 4. INVENTORY CATALOG MODULE
// ====================================================================
function renderProducts(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3 w-1/2">
        <div class="relative w-2/3">
          <input type="text" id="prod-search" placeholder="Search catalog by fabric name..." class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
          <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-3"></i>
        </div>
        <select id="prod-cat-filter" class="w-1/3 px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Categories</option>
        </select>
      </div>
      <button onclick="openAddProductModal()" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition duration-200">
        <i data-lucide="plus" class="w-4 h-4"></i> Add Fabric Item
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="p-4">Fabric Product</th>
            <th class="p-4">Category</th>
            <th class="p-4 text-right">Cost Price (Purchase)</th>
            <th class="p-4 text-right">Retail Selling Price</th>
            <th class="p-4 text-right">Stock Quantity</th>
            <th class="p-4 text-center">Status</th>
            <th class="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody id="products-list-body" class="divide-y divide-gray-100 text-xs text-gray-700">
          <!-- dyn -->
        </tbody>
      </table>
    </div>

    <!-- ADD PRODUCT MODAL -->
    <div id="add-prod-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 class="font-bold text-sm" id="prod-modal-title">Add Fabric Item</h3>
          <button onclick="closeAddProductModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form id="add-prod-form" class="p-6 space-y-4">
          <input type="hidden" id="edit-prod-id">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Fabric Name <span class="text-red-500">*</span></label>
            <input type="text" id="prod-name" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Category <span class="text-red-500">*</span></label>
            <input type="text" id="prod-cat" required placeholder="e.g. Lawn, Silk, Cotton" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cost Price (Rs) <span class="text-red-500">*</span></label>
              <input type="number" id="prod-cost" min="0" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (Rs) <span class="text-red-500">*</span></label>
              <input type="number" id="prod-price" min="0" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity <span class="text-red-500">*</span></label>
              <input type="number" id="prod-qty" min="0" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Unit <span class="text-red-500">*</span></label>
              <input type="text" id="prod-unit" required value="meters" placeholder="e.g. meters, pcs" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Reorder Limit <span class="text-red-500">*</span></label>
              <input type="number" id="prod-reorder" min="0" required value="10" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
            </div>
          </div>
          <div class="pt-2 flex justify-end gap-3">
            <button type="button" onclick="closeAddProductModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Save Item</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Search and Filter Events
  const searchInput = document.getElementById("prod-search");
  const catFilter = document.getElementById("prod-cat-filter");

  searchInput.addEventListener("input", filterProducts);
  catFilter.addEventListener("change", filterProducts);

  // Load distinct categories for dropdown
  const categories = [...new Set(state.products.map(p => p.category))];
  categories.forEach(cat => {
    catFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  populateProductsList();

  // Add / Edit Product Submit
  const form = document.getElementById("add-prod-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-prod-id").value;
    const name = document.getElementById("prod-name").value;
    const category = document.getElementById("prod-cat").value;
    const price = Number(document.getElementById("prod-price").value);
    const cost_price = Number(document.getElementById("prod-cost").value);
    const stock_qty = Number(document.getElementById("prod-qty").value);
    const unit = document.getElementById("prod-unit").value;
    const reorder_level = Number(document.getElementById("prod-reorder").value);

    const payload = { name, category, price, cost_price, stock_qty, unit, reorder_level };

    if (id) {
      // Edit
      const data = await apiCall(`/products/${id}`, "PUT", payload);
      if (data) {
        showToast("Product updated successfully!");
        const idx = state.products.findIndex(p => p.id === Number(id));
        if (idx !== -1) state.products[idx] = data;
        closeAddProductModal();
        populateProductsList();
      }
    } else {
      // Add
      const data = await apiCall("/products", "POST", payload);
      if (data) {
        showToast("New product cataloged!");
        state.products.push(data);
        closeAddProductModal();
        populateProductsList();
      }
    }
  });
}

function filterProducts() {
  const q = document.getElementById("prod-search").value.toLowerCase();
  const cat = document.getElementById("prod-cat-filter").value;
  populateProductsList(q, cat);
}

function populateProductsList(search = "", category = "") {
  const tbody = document.getElementById("products-list-body");
  if (!tbody) return;

  const filtered = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search);
    const matchesCat = category === "" || p.category === category;
    return matchesSearch && matchesCat;
  });

  tbody.innerHTML = filtered.map(p => {
    const isLow = p.stock_qty <= p.reorder_level;
    return `
      <tr class="hover:bg-gray-50/50">
        <td class="p-4 font-semibold text-gray-800">${p.name}</td>
        <td class="p-4 text-gray-500 font-medium">${p.category}</td>
        <td class="p-4 text-right font-mono text-gray-600">Rs. ${Number(p.cost_price).toLocaleString()}</td>
        <td class="p-4 text-right font-mono font-semibold text-gray-850">Rs. ${Number(p.price).toLocaleString()}</td>
        <td class="p-4 text-right font-mono font-bold">${p.stock_qty} ${p.unit}</td>
        <td class="p-4 text-center">
          <span class="px-2 py-0.5 rounded font-bold text-[9px] uppercase ${isLow ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}">
            ${isLow ? "Low Stock" : "Healthy"}
          </span>
        </td>
        <td class="p-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <button onclick="openEditProductModal(${p.id})" class="text-xs font-bold text-gray-600 hover:text-slate-900 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
              Edit
            </button>
            <button onclick="deleteProduct(${p.id})" class="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-100 px-2 py-1 rounded hover:bg-red-100">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-400">No products match criteria.</td></tr>`;
  }

  if (window.lucide) window.lucide.createIcons();
}

async function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    const data = await apiCall(`/products/${id}`, "DELETE");
    if (data) {
      showToast("Fabric product removed from inventory.");
      state.products = state.products.filter(p => p.id !== id);
      populateProductsList();
    }
  }
}

function openAddProductModal() {
  document.getElementById("prod-modal-title").textContent = "Catalog New Fabric Product";
  document.getElementById("edit-prod-id").value = "";
  document.getElementById("add-prod-form").reset();
  document.getElementById("add-prod-modal").classList.remove("hidden");
  document.getElementById("prod-name").focus();
}

function openEditProductModal(id) {
  const p = state.products.find(prod => prod.id === id);
  if (!p) return;

  document.getElementById("prod-modal-title").textContent = "Modify Catalog Product";
  document.getElementById("edit-prod-id").value = p.id;
  document.getElementById("prod-name").value = p.name;
  document.getElementById("prod-cat").value = p.category;
  document.getElementById("prod-price").value = p.price;
  document.getElementById("prod-cost").value = p.cost_price;
  document.getElementById("prod-qty").value = p.stock_qty;
  document.getElementById("prod-unit").value = p.unit;
  document.getElementById("prod-reorder").value = p.reorder_level;

  document.getElementById("add-prod-modal").classList.remove("hidden");
  document.getElementById("prod-name").focus();
}

function closeAddProductModal() {
  document.getElementById("add-prod-modal").classList.add("hidden");
}

// ====================================================================
// 5. FABRIC BILLING & INVOICES
// ====================================================================
function renderInvoices(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3 w-1/3">
        <div class="relative w-full">
          <input type="text" id="inv-search" placeholder="Search invoices by reference or customer..." class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
          <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-3"></i>
        </div>
      </div>
      <button onclick="openNewInvoiceModal()" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition duration-200 shadow-sm">
        <i data-lucide="receipt" class="w-4.5 h-4.5"></i> Create New Fabric Bill
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="p-4">Invoice No</th>
            <th class="p-4">Customer</th>
            <th class="p-4">Billing Date</th>
            <th class="p-4 text-right">Invoice Total</th>
            <th class="p-4 text-right">Amount Received</th>
            <th class="p-4 text-right">Account Balance</th>
            <th class="p-4 text-center">Payment Term</th>
            <th class="p-4 text-center">Print / Delete</th>
          </tr>
        </thead>
        <tbody id="invoices-list-body" class="divide-y divide-gray-100 text-xs text-gray-700">
          <!-- dynamic -->
        </tbody>
      </table>
    </div>

    <!-- CREATE INVOICE MODAL -->
    <div id="new-invoice-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div class="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-sm">Create New Fabric Billing Invoice</h3>
          <button onclick="closeNewInvoiceModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form id="new-invoice-form" class="p-6 flex-1 overflow-y-auto flex flex-col">
          
          <!-- Customers, Terms, Dates row -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Billing Customer <span class="text-red-500">*</span></label>
              <select id="inv-cust-id" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
                <option value="">-- Choose Customer Ledger --</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
              <input type="date" id="inv-date" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Term</label>
              <select id="inv-term" class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
                <option value="cash">Cash Sale</option>
                <option value="credit">On Ledger Credit</option>
              </select>
            </div>
          </div>

          <!-- Invoice Multi-Items Sheet -->
          <div class="flex-1 mb-6">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items (Selected Fabrics)</h4>
              <button type="button" onclick="addInvoiceItemRow()" class="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1">
                <i data-lucide="plus-circle" class="w-4 h-4"></i> Add Fabric Line
              </button>
            </div>
            <div class="overflow-x-auto border border-gray-200 rounded-lg">
              <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                  <tr class="border-b border-gray-200">
                    <th class="p-3 w-1/2">Fabric Product</th>
                    <th class="p-3 text-right">Quantity</th>
                    <th class="p-3 text-right">Unit Price</th>
                    <th class="p-3 text-right">Subtotal</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody id="invoice-items-tbody" class="divide-y divide-gray-100 text-xs">
                  <!-- line item rows populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totals, Discounts, GST Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Notes / Remarks</label>
              <textarea id="inv-notes" rows="3" placeholder="Additional details..." class="w-full p-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none"></textarea>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Subtotal:</span>
                <span id="inv-subtotal-display" class="font-bold font-mono">Rs. 0</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Discount (PKR):</span>
                <input type="number" id="inv-discount-input" value="0" min="0" class="w-24 px-2 py-1 text-right border border-gray-200 rounded font-mono text-xs">
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Govt Sales Tax / GST (18%):</span>
                <span id="inv-gst-display" class="font-semibold text-gray-600 font-mono">Rs. 0</span>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <span class="text-gray-800 font-bold">Grand Total:</span>
                <span id="inv-total-display" class="text-lg font-bold text-emerald-600 font-mono">Rs. 0</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-800 font-bold">Amount Paid (PKR):</span>
                <input type="number" id="inv-paid-input" value="0" min="0" class="w-32 px-3 py-1.5 text-right border border-gray-200 rounded font-mono text-sm font-semibold text-emerald-700 bg-emerald-50 focus:outline-none">
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Remaining Ledger Balance:</span>
                <span id="inv-balance-display" class="font-bold font-mono text-rose-600">Rs. 0</span>
              </div>
            </div>
          </div>

          <div class="pt-6 flex justify-end gap-3 mt-4 shrink-0">
            <button type="button" onclick="closeNewInvoiceModal()" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">Cancel</button>
            <button type="submit" class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1.5">
              <i data-lucide="receipt" class="w-4 h-4"></i> Generate Bill & Print
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Search filter
  const searchInput = document.getElementById("inv-search");
  searchInput.addEventListener("input", () => {
    populateInvoicesList(searchInput.value.toLowerCase());
  });

  populateInvoicesList();

  // Invoice form submit
  const form = document.getElementById("new-invoice-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const customer_id = Number(document.getElementById("inv-cust-id").value);
    const date = document.getElementById("inv-date").value;
    const payment_type = document.getElementById("inv-term").value;
    const discount = Number(document.getElementById("inv-discount-input").value);
    const paid = Number(document.getElementById("inv-paid-input").value);

    // Collect line items
    const rows = document.querySelectorAll(".invoice-item-row");
    const items = [];
    rows.forEach(row => {
      const product_id = Number(row.querySelector(".row-product-select").value);
      const qty = Number(row.querySelector(".row-qty-input").value);
      const unit_price = Number(row.querySelector(".row-price-input").value);
      
      if (product_id && qty > 0) {
        items.push({ product_id, qty, unit_price });
      }
    });

    if (items.length === 0) {
      alert("Please add at least one fabric item before saving billing!");
      return;
    }

    const payload = {
      customer_id,
      date,
      payment_type,
      discount,
      paid,
      items
    };

    const data = await apiCall("/invoices", "POST", payload);
    if (data) {
      showToast("Invoice processed and stock decremented!");
      loadAllData();
      closeNewInvoiceModal();
      
      // Print the invoice directly
      printInvoiceLayout(data);
    }
  });
}

function populateInvoicesList(filter = "") {
  const tbody = document.getElementById("invoices-list-body");
  if (!tbody) return;

  const filtered = state.invoices.filter(inv => {
    const cust = state.customers.find(c => c.id === inv.customer_id) || { name: "" };
    return inv.invoice_no.toLowerCase().includes(filter) || cust.name.toLowerCase().includes(filter);
  });

  tbody.innerHTML = filtered.slice().reverse().map(inv => {
    const cust = state.customers.find(c => c.id === inv.customer_id) || { name: "Unknown" };
    const isCredit = inv.payment_type === "credit";
    return `
      <tr class="hover:bg-gray-50/50">
        <td class="p-4 font-semibold text-gray-800 font-mono">${inv.invoice_no}</td>
        <td class="p-4 font-medium text-gray-700">${cust.name}</td>
        <td class="p-4 text-gray-500 font-mono text-xs">${inv.date}</td>
        <td class="p-4 text-right font-bold text-gray-900">Rs. ${Number(inv.total).toLocaleString()}</td>
        <td class="p-4 text-right text-emerald-600 font-semibold">Rs. ${Number(inv.paid).toLocaleString()}</td>
        <td class="p-4 text-right font-bold text-rose-600">Rs. ${Number(inv.balance).toLocaleString()}</td>
        <td class="p-4 text-center">
          <span class="px-2 py-0.5 rounded font-bold text-[9px] uppercase ${isCredit ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}">
            ${inv.payment_type}
          </span>
        </td>
        <td class="p-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <button onclick="printInvoiceLayoutById(${inv.id})" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded">
              Print A4
            </button>
            <button onclick="deleteInvoice(${inv.id})" class="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-100 px-2 py-1 rounded hover:bg-red-100">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-gray-400">No invoices generated yet.</td></tr>`;
  }

  if (window.lucide) window.lucide.createIcons();
}

async function deleteInvoice(id) {
  if (confirm("Are you sure you want to delete this invoice? This will restore fabric stock levels.")) {
    const data = await apiCall(`/invoices/${id}`, "DELETE");
    if (data) {
      showToast("Invoice deleted and inventory stock restored.");
      loadAllData();
    }
  }
}

function openNewInvoiceModal() {
  const select = document.getElementById("inv-cust-id");
  select.innerHTML = '<option value="">-- Choose Customer Ledger --</option>';
  state.customers.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name} (${c.type.toUpperCase()})</option>`;
  });

  document.getElementById("inv-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("invoice-items-tbody").innerHTML = "";
  
  // Add an initial empty row
  addInvoiceItemRow();

  // Reset calculations
  document.getElementById("inv-notes").value = "";
  document.getElementById("inv-discount-input").value = "0";
  document.getElementById("inv-paid-input").value = "0";
  recalcInvoiceTotals();

  // Setup reactive changes to calculations
  document.getElementById("inv-discount-input").addEventListener("input", recalcInvoiceTotals);
  document.getElementById("inv-paid-input").addEventListener("input", recalcInvoiceTotals);

  document.getElementById("new-invoice-modal").classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeNewInvoiceModal() {
  document.getElementById("new-invoice-modal").classList.add("hidden");
}

let invoiceRowId = 0;
function addInvoiceItemRow() {
  const tbody = document.getElementById("invoice-items-tbody");
  invoiceRowId++;
  
  const tr = document.createElement("tr");
  tr.id = `inv-row-${invoiceRowId}`;
  tr.className = "invoice-item-row hover:bg-gray-50/30";

  tr.innerHTML = `
    <td class="p-3">
      <select class="row-product-select w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:border-emerald-500">
        <option value="">-- Select Fabric Product --</option>
        ${state.products.map(p => `<option value="${p.id}">${p.name} (Cat: ${p.category} | Stock: ${p.stock_qty} ${p.unit} | Rs. ${p.price})</option>`).join("")}
      </select>
    </td>
    <td class="p-3 text-right">
      <input type="number" value="1" min="1" class="row-qty-input w-20 px-2 py-1 text-right border border-gray-200 rounded font-mono text-xs">
    </td>
    <td class="p-3 text-right font-mono text-xs">
      Rs. <input type="number" readonly class="row-price-input w-24 text-right border border-gray-100 bg-gray-50 rounded font-mono text-xs py-1" value="0">
    </td>
    <td class="p-3 text-right font-mono text-xs font-bold text-gray-800 row-subtotal-cell">
      Rs. 0
    </td>
    <td class="p-3 text-center">
      <button type="button" onclick="removeInvoiceItemRow(${invoiceRowId})" class="text-red-500 hover:text-red-700 font-bold"><i data-lucide="minus-circle" class="w-4 h-4"></i></button>
    </td>
  `;

  tbody.appendChild(tr);

  // Setup row change listeners for reactive auto-updates
  const prodSelect = tr.querySelector(".row-product-select");
  const qtyInput = tr.querySelector(".row-qty-input");

  prodSelect.addEventListener("change", () => {
    const pid = Number(prodSelect.value);
    const prod = state.products.find(p => p.id === pid);
    if (prod) {
      tr.querySelector(".row-price-input").value = prod.price;
      qtyInput.max = prod.stock_qty;
    } else {
      tr.querySelector(".row-price-input").value = "0";
    }
    recalcInvoiceTotals();
  });

  qtyInput.addEventListener("input", recalcInvoiceTotals);

  if (window.lucide) window.lucide.createIcons();
}

function removeInvoiceItemRow(id) {
  const row = document.getElementById(`inv-row-${id}`);
  if (row) {
    row.remove();
    recalcInvoiceTotals();
  }
}

function recalcInvoiceTotals() {
  let subtotal = 0;
  const rows = document.querySelectorAll(".invoice-item-row");

  rows.forEach(row => {
    const qty = Number(row.querySelector(".row-qty-input").value) || 0;
    const price = Number(row.querySelector(".row-price-input").value) || 0;
    const rowSub = qty * price;
    subtotal += rowSub;

    row.querySelector(".row-subtotal-cell").textContent = `Rs. ${rowSub.toLocaleString()}`;
  });

  const discount = Number(document.getElementById("inv-discount-input").value) || 0;
  // Apply standard GST sales tax of 18% on fabric value in Pakistan
  const gst = Math.round((subtotal - discount) * 0.18);
  const total = Math.max(0, (subtotal - discount) + gst);
  const paid = Number(document.getElementById("inv-paid-input").value) || 0;
  const balance = Math.max(0, total - paid);

  document.getElementById("inv-subtotal-display").textContent = `Rs. ${subtotal.toLocaleString()}`;
  document.getElementById("inv-gst-display").textContent = `Rs. ${gst.toLocaleString()}`;
  document.getElementById("inv-total-display").textContent = `Rs. ${total.toLocaleString()}`;
  document.getElementById("inv-balance-display").textContent = `Rs. ${balance.toLocaleString()}`;
}

// ====================================================================
// 6. SHOP OPERATING EXPENSES
// ====================================================================
function renderExpenses(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3 w-1/3">
        <div class="relative w-full">
          <input type="text" id="exp-search" placeholder="Search operational expenses..." class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
          <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-3"></i>
        </div>
      </div>
      <button onclick="openAddExpenseModal()" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition duration-200 shadow-sm">
        <i data-lucide="plus" class="w-4 h-4"></i> Log Expense
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="p-4">Expense Category</th>
            <th class="p-4">Description</th>
            <th class="p-4 text-center">Expense Date</th>
            <th class="p-4 text-right">Amount (PKR)</th>
            <th class="p-4 text-center">Delete</th>
          </tr>
        </thead>
        <tbody id="expenses-list-body" class="divide-y divide-gray-100 text-xs text-gray-700">
          <!-- Dyn -->
        </tbody>
      </table>
    </div>

    <!-- ADD EXPENSE MODAL -->
    <div id="add-exp-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 class="font-bold text-sm">Log Shop Operating Expense</h3>
          <button onclick="closeAddExpenseModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form id="add-exp-form" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Category <span class="text-red-500">*</span></label>
            <select id="exp-category" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option value="Rent">Shop Rent</option>
              <option value="Salary">Staff Salary</option>
              <option value="Electricity">Electricity Bill</option>
              <option value="Transport">Carriage Inward / Transport</option>
              <option value="Tea/Entertainment">Entertainment / Food / Tea</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (Rs) <span class="text-red-500">*</span></label>
            <input type="number" id="exp-amount" min="1" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none font-semibold">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Expense Date</label>
            <input type="date" id="exp-date" required class="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Remarks / Note</label>
            <textarea id="exp-desc" rows="2" placeholder="e.g. June rent paid to landlord" class="w-full p-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none"></textarea>
          </div>
          <div class="pt-2 flex justify-end gap-3">
            <button type="button" onclick="closeAddExpenseModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const searchInput = document.getElementById("exp-search");
  searchInput.addEventListener("input", () => {
    populateExpensesList(searchInput.value.toLowerCase());
  });

  populateExpensesList();

  // Add Expense form submit
  const form = document.getElementById("add-exp-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const category = document.getElementById("exp-category").value;
    const amount = Number(document.getElementById("exp-amount").value);
    const date = document.getElementById("exp-date").value;
    const description = document.getElementById("exp-desc").value;

    const data = await apiCall("/expenses", "POST", { category, amount, date, description });
    if (data) {
      showToast("Operating expense registered!");
      state.expenses.push(data);
      closeAddExpenseModal();
      populateExpensesList();
    }
  });
}

function populateExpensesList(filter = "") {
  const tbody = document.getElementById("expenses-list-body");
  if (!tbody) return;

  const filtered = state.expenses.filter(e => 
    e.category.toLowerCase().includes(filter) || 
    (e.description && e.description.toLowerCase().includes(filter))
  );

  tbody.innerHTML = filtered.slice().reverse().map(e => `
    <tr class="hover:bg-gray-50/50">
      <td class="p-4 font-semibold text-gray-800">${e.category}</td>
      <td class="p-4 text-gray-500 font-medium">${e.description || "---"}</td>
      <td class="p-4 text-center font-mono text-gray-500">${e.date}</td>
      <td class="p-4 text-right font-mono font-bold text-rose-600">Rs. ${Number(e.amount).toLocaleString()}</td>
      <td class="p-4 text-center">
        <button onclick="deleteExpense(${e.id})" class="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-100 px-2.5 py-1 rounded hover:bg-red-100">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    </tr>
  `).join("");

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-400">No expenses logged.</td></tr>`;
  }

  if (window.lucide) window.lucide.createIcons();
}

async function deleteExpense(id) {
  if (confirm("Are you sure you want to delete this expense log?")) {
    const data = await apiCall(`/expenses/${id}`, "DELETE");
    if (data) {
      showToast("Expense log deleted.");
      state.expenses = state.expenses.filter(e => e.id !== id);
      populateExpensesList();
    }
  }
}

function openAddExpenseModal() {
  document.getElementById("add-exp-form").reset();
  document.getElementById("exp-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("add-exp-modal").classList.remove("hidden");
  document.getElementById("exp-amount").focus();
}

function closeAddExpenseModal() {
  document.getElementById("add-exp-modal").classList.add("hidden");
}

// ====================================================================
// 7. FINANCIAL REPORTS (P&L + Chart.js Chart)
// ====================================================================
async function renderReports(container) {
  container.innerHTML = `
    <!-- P&L Sheet and Chart Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
      <!-- Profit & Loss Statement Sheet -->
      <div class="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex flex-col">
        <h4 class="font-bold text-gray-800 flex items-center gap-2 pb-4 border-b border-gray-100 mb-6 uppercase tracking-wider text-xs">
          <i data-lucide="wallet" class="w-5 h-5 text-emerald-600"></i>
          Income Statement (Profit & Loss)
        </h4>
        <div id="pl-statement-sheet" class="flex-1 space-y-4 text-sm text-gray-700">
          <div class="flex items-center justify-center py-10">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>

      <!-- Monthly Sales Chart.js Widget -->
      <div class="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
        <h4 class="font-bold text-gray-800 flex items-center gap-2 pb-4 border-b border-gray-100 mb-6 uppercase tracking-wider text-xs">
          <i data-lucide="bar-chart-3" class="w-5 h-5 text-indigo-600"></i>
          6-Month Fabric Sales Revenue Trend
        </h4>
        <div class="relative h-72">
          <canvas id="salesTrendChart"></canvas>
        </div>
      </div>

    </div>
  `;

  // Fetch real P&L and Monthly Trend from server
  const plData = await apiCall("/reports/profit-loss");
  const monthlySales = await apiCall("/reports/monthly-sales");

  if (plData) {
    const plSheet = document.getElementById("pl-statement-sheet");
    const grossMargin = plData.gross_profit_margin_pct || 0;
    const netMargin = plData.net_profit_margin_pct || 0;

    plSheet.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between font-medium py-1.5 border-b border-gray-100/50">
          <span class="text-gray-500">Revenue (Total Invoice Fabric Billing)</span>
          <span class="font-bold font-mono text-gray-800">Rs. ${plData.total_revenue.toLocaleString()}</span>
        </div>
        <div class="flex justify-between font-medium py-1.5 border-b border-gray-100/50">
          <span class="text-gray-500">Cost of Goods Sold (Fabric Purchase Cost)</span>
          <span class="font-semibold font-mono text-rose-500">- Rs. ${plData.total_cogs.toLocaleString()}</span>
        </div>
        <div class="flex justify-between py-2 border-b-2 border-slate-900 font-bold bg-gray-50/50 px-2 rounded">
          <span class="text-gray-800">GROSS PROFIT</span>
          <span class="font-mono text-emerald-600">Rs. ${plData.gross_profit.toLocaleString()}</span>
        </div>
        
        <div class="pt-4 flex justify-between font-medium py-1.5 border-b border-gray-100/50">
          <span class="text-gray-500">Operating Expenses (Shop Rent, Bills, Transport)</span>
          <span class="font-semibold font-mono text-rose-500">- Rs. ${plData.total_expenses.toLocaleString()}</span>
        </div>
        <div class="flex justify-between py-2.5 border-b-4 border-emerald-600 font-bold bg-emerald-50/40 px-2 rounded">
          <span class="text-emerald-800 text-base">NET PROFIT</span>
          <span class="font-mono text-emerald-700 text-lg">Rs. ${plData.net_profit.toLocaleString()}</span>
        </div>
      </div>

      <!-- Financial Efficiency KPI Badges -->
      <div class="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-gray-100">
        <div class="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 text-center">
          <p class="text-[10px] font-bold text-blue-500 uppercase">Gross Profit Margin</p>
          <h5 class="text-xl font-bold text-blue-700 mt-1">${grossMargin}%</h5>
        </div>
        <div class="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center">
          <p class="text-[10px] font-bold text-emerald-500 uppercase">Net Profit Margin</p>
          <h5 class="text-xl font-bold text-emerald-700 mt-1">${netMargin}%</h5>
        </div>
      </div>
    `;
  }

  if (monthlySales && window.Chart) {
    const ctx = document.getElementById("salesTrendChart").getContext("2d");
    
    // Clear old chart if existing to prevent overlays
    if (window.salesChartInstance) {
      window.salesChartInstance.destroy();
    }

    const labels = monthlySales.map(item => item.month);
    const totals = monthlySales.map(item => item.total);

    window.salesChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Fabric Revenue (Rs.)",
          data: totals,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3.5,
          pointBackgroundColor: "#10b981",
          pointRadius: 5,
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            grid: {
              color: "#f3f4f6"
            },
            ticks: {
              font: {
                family: "JetBrains Mono"
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

// ====================================================================
// 8. LARAVEL & SQL LOCAL DEPLOYMENT FILE PANEL
// ====================================================================
function renderLaravel(container) {
  container.innerHTML = `
    <div class="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 mb-8">
      <div class="flex items-start gap-4 mb-6">
        <div class="p-3 bg-red-50 text-rose-600 rounded-xl shrink-0">
          <i data-lucide="folder-archive" class="w-8 h-8"></i>
        </div>
        <div>
          <h3 class="font-bold text-lg text-gray-800">Your Complete PHP Laravel + MySQL Codebase is Ready!</h3>
          <p class="text-sm text-gray-500 mt-1 leading-relaxed">
            The full source code of <strong>Hashmi Fabrics Business Management System</strong> in PHP Laravel is stored directly inside the <strong>/laravel-app</strong> folder of this project workspace. You can export/download the whole codebase to run locally using the AI Studio export tool.
          </p>
        </div>
      </div>

      <!-- Quick Directory Structure Map -->
      <div class="border border-gray-100 rounded-lg bg-gray-50 p-4 font-mono text-xs text-gray-600 leading-normal mb-6">
        <span class="text-emerald-700 font-bold">/laravel-app/</span> (Laravel Core Directory Tree)<br>
        ├── <span class="text-slate-800 font-semibold">app/Http/Controllers/</span> (DashboardController, CustomerController, InvoiceController, ProductController, etc.)<br>
        ├── <span class="text-slate-800 font-semibold">database/migrations/</span> (Database tables creation migrations schemas)<br>
        ├── <span class="text-slate-800 font-semibold">resources/views/</span> (Dashboard, Customer ledgers, invoices blade pages & printing templates)<br>
        ├── <span class="text-slate-800 font-semibold">routes/web.php</span> (Complete modular business routing schemas)<br>
        └── <span class="text-slate-800 font-semibold">.env.example</span> (MySQL credentials local configuration variables)
      </div>

      <div class="flex items-center gap-4">
        <div class="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-lg flex items-center gap-2">
          <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 shrink-0"></i>
          Your exportable Laravel architecture matches the exact schema of this live database preview!
        </div>
      </div>
    </div>

    <!-- SQL Schema Database Panel -->
    <div class="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
      <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div>
          <h4 class="font-bold text-gray-800 text-sm flex items-center gap-2">
            <i data-lucide="database" class="w-5 h-5 text-emerald-600"></i>
            MySQL Database SQL Schema (database.sql)
          </h4>
          <p class="text-xs text-gray-500 mt-0.5">Copy this schema and seed script to setup your local MySQL database in phpMyAdmin.</p>
        </div>
        <button onclick="copySQLSchemaToClipboard()" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy SQL Schema
        </button>
      </div>

      <div class="relative">
        <textarea id="sql-code-block" readonly class="w-full h-80 bg-slate-950 text-slate-300 font-mono text-xs p-5 rounded-lg border border-slate-800/50 resize-none focus:outline-none focus:ring-0 leading-normal" style="font-family: 'JetBrains Mono', monospace;"></textarea>
      </div>
    </div>
  `;

  // Fetch schema content from local /database.sql
  fetch("/database.sql")
    .then(res => res.text())
    .then(code => {
      const block = document.getElementById("sql-code-block");
      if (block) block.value = code;
    })
    .catch(err => {
      console.error("Failed loading SQL script:", err);
    });

  if (window.lucide) window.lucide.createIcons();
}

function copySQLSchemaToClipboard() {
  const block = document.getElementById("sql-code-block");
  if (!block) return;

  block.select();
  document.execCommand("copy");
  showToast("MySQL Database SQL script copied to clipboard!");
}

// ====================================================================
// PRINTING AND RECEIPT GENERATOR SUB-MODULES
// ====================================================================

function printInvoiceLayoutById(id) {
  const inv = state.invoices.find(invoice => invoice.id === id);
  if (inv) printInvoiceLayout(inv);
}

function printInvoiceLayout(inv) {
  const customer = state.customers.find(c => c.id === inv.customer_id) || { name: "Guest Customer", phone: "---", type: "retail" };
  const printSection = document.getElementById("print-section");
  if (!printSection) return;

  // Build rows html
  const rowsHtml = inv.items ? inv.items.map(item => {
    const prod = state.products.find(p => p.id === item.product_id) || { name: "Fabric Piece", unit: "meters" };
    return `
      <tr class="border-b border-gray-200">
        <td class="py-3 text-gray-800 font-semibold">${prod.name}</td>
        <td class="py-3 text-right font-mono">${item.qty} ${prod.unit}</td>
        <td class="py-3 text-right font-mono">Rs. ${Number(item.unit_price).toLocaleString()}</td>
        <td class="py-3 text-right font-mono font-bold">Rs. ${Number(item.total).toLocaleString()}</td>
      </tr>
    `;
  }).join("") : `
    <tr class="border-b border-gray-200">
      <td class="py-3 text-gray-800 font-semibold">Lawn Premium Fabric 3m</td>
      <td class="py-3 text-right font-mono">1 Suit</td>
      <td class="py-3 text-right font-mono">Rs. ${Number(inv.total).toLocaleString()}</td>
      <td class="py-3 text-right font-mono font-bold">Rs. ${Number(inv.total).toLocaleString()}</td>
    </tr>
  `;

  // Construct A4 layout
  printSection.innerHTML = `
    <div class="p-12 max-w-4xl mx-auto bg-white text-gray-900 leading-normal" style="font-family: 'Inter', sans-serif;">
      
      <!-- Invoice Header -->
      <div class="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">HASHMI FABRICS</h1>
          <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Lawn, Silk, Cotton & Embroidery Suits Wholesale Ledger accounts</p>
          <p class="text-xs text-gray-500 mt-0.5">Main Bazar, Lahore, Pakistan | Phone: 0300-1234567</p>
        </div>
        <div class="text-right">
          <h2 class="text-xl font-bold text-emerald-600">FABRIC BILL</h2>
          <p class="text-xs font-mono text-gray-500 mt-1">Invoice: <span class="font-bold text-gray-850">${inv.invoice_no}</span></p>
          <p class="text-xs font-mono text-gray-500">Date: ${inv.date}</p>
        </div>
      </div>

      <!-- Customer details info -->
      <div class="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To:</h4>
          <p class="font-bold text-gray-800 text-base">${customer.name}</p>
          <p class="text-gray-500 font-mono mt-0.5">Phone: ${customer.phone || "---"}</p>
          <p class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded inline-block font-semibold uppercase tracking-wide mt-2">
            ${customer.type} Customer Ledger
          </p>
        </div>
        <div class="text-right">
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment terms:</h4>
          <p class="font-bold uppercase text-gray-800">${inv.payment_type} TRANSACTION</p>
          <p class="text-xs text-gray-500 mt-1">Hashmi Fabrics Ledgers Suite</p>
        </div>
      </div>

      <!-- Items Table -->
      <table class="w-full text-left border-collapse mb-8 text-sm">
        <thead>
          <tr class="border-b-2 border-slate-300 text-xs font-bold text-gray-400 uppercase">
            <th class="py-2.5">Fabric product details</th>
            <th class="py-2.5 text-right">Quantity</th>
            <th class="py-2.5 text-right">Unit Rate</th>
            <th class="py-2.5 text-right">Net Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Grand Summaries -->
      <div class="flex justify-end mb-12">
        <div class="w-80 space-y-2 text-sm border-t border-gray-100 pt-4">
          <div class="flex justify-between text-gray-500">
            <span>Billing Subtotal:</span>
            <span class="font-mono">Rs. ${Number(inv.subtotal || inv.total).toLocaleString()}</span>
          </div>
          <div class="flex justify-between text-gray-500">
            <span>Special Discount:</span>
            <span class="font-mono">- Rs. ${Number(inv.discount || 0).toLocaleString()}</span>
          </div>
          <div class="flex justify-between text-gray-500">
            <span>Govt Sales Tax (GST 18%):</span>
            <span class="font-mono">Rs. ${Math.round((Number(inv.subtotal || inv.total) - Number(inv.discount || 0)) * 0.18).toLocaleString()}</span>
          </div>
          <div class="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-bold text-gray-900 bg-gray-50 p-2 rounded">
            <span>Grand Total Due:</span>
            <span class="font-mono text-emerald-700">Rs. ${Number(inv.total).toLocaleString()}</span>
          </div>
          <div class="flex justify-between text-emerald-600 font-semibold p-2">
            <span>Amount Received (Cash):</span>
            <span class="font-mono">Rs. ${Number(inv.paid).toLocaleString()}</span>
          </div>
          <div class="flex justify-between text-rose-600 font-bold p-2 border-t border-gray-100">
            <span>Ledger Account Balance:</span>
            <span class="font-mono">Rs. ${Number(inv.balance).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Bottom terms signature -->
      <div class="border-t border-gray-200 pt-8 flex justify-between text-xs text-gray-400">
        <div>
          <p class="font-bold text-gray-500">Thank you for your valuable business!</p>
          <p class="mt-1">Computer-generated business billing ledger statement.</p>
        </div>
        <div class="text-right w-48 border-t border-gray-300 pt-1 mt-6">
          <p class="font-semibold text-gray-600">Authorized Signature</p>
          <p class="text-[10px] text-gray-400 mt-0.5">Hashmi Fabrics Corporate</p>
        </div>
      </div>

    </div>
  `;

  // Execute print
  window.print();
}

function printPaymentReceipt(payment, customerId) {
  const customer = state.customers.find(c => c.id === Number(customerId)) || { name: "Guest Ledger" };
  const printSection = document.getElementById("print-section");
  if (!printSection) return;

  printSection.innerHTML = `
    <div class="p-12 max-w-xl mx-auto bg-white text-gray-900 border-2 border-slate-200 rounded-lg shadow-sm" style="font-family: 'Inter', sans-serif;">
      
      <!-- Receipt Logo Header -->
      <div class="text-center border-b border-gray-200 pb-6 mb-6">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 uppercase">HASHMI FABRICS</h1>
        <p class="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1">CASH RECEIPT VOUCHER</p>
        <p class="text-[10px] text-gray-400 mt-1">Main Bazar, Lahore, Pakistan | Phone: 0300-1234567</p>
      </div>

      <div class="space-y-4 text-xs text-gray-700">
        <div class="flex justify-between">
          <span class="text-gray-400 font-medium">Receipt Date:</span>
          <span class="font-bold text-gray-800 font-mono">${payment.date}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400 font-medium">Customer Account Ledger:</span>
          <span class="font-bold text-gray-800 text-right">${customer.name}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400 font-medium">Payment Received For:</span>
          <span class="font-semibold text-indigo-600">${payment.invoice_id ? "Invoice Record #" + payment.invoice_id : "General Ledger Balance Settlement"}</span>
        </div>
        
        <div class="py-4 border-y border-dashed border-gray-200 text-center">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AMOUNT RECEIVED (PKR)</p>
          <h2 class="text-3xl font-extrabold text-emerald-600 mt-1">Rs. ${Number(payment.amount).toLocaleString()}</h2>
          <p class="text-[10px] text-gray-400 font-medium italic mt-1">Amount received with thanks.</p>
        </div>

        <div class="flex justify-between text-[11px] pt-4">
          <span class="text-gray-400">Ledger Status:</span>
          <span class="font-bold text-gray-800">Account updated automatically</span>
        </div>
      </div>

      <div class="mt-12 flex justify-between text-center text-[10px] text-gray-400">
        <div class="w-24 border-t border-gray-200 pt-1">
          Customer Sig
        </div>
        <div class="w-24 border-t border-gray-200 pt-1">
          Receivers Sig
        </div>
      </div>

    </div>
  `;

  window.print();
}

function printLedgerItem(ref, amount, date) {
  const printSection = document.getElementById("print-section");
  if (!printSection) return;

  printSection.innerHTML = `
    <div class="p-12 max-w-xl mx-auto bg-white text-gray-900 border-2 border-slate-200 rounded" style="font-family: 'Inter', sans-serif;">
      <div class="text-center border-b border-gray-200 pb-4 mb-6">
        <h1 class="text-xl font-bold tracking-tight text-slate-900 uppercase">HASHMI FABRICS</h1>
        <p class="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-0.5">LEDGER TRANSACTION RECORD</p>
      </div>

      <div class="space-y-4 text-xs text-gray-700">
        <div class="flex justify-between">
          <span class="text-gray-400">Date:</span>
          <span class="font-bold text-gray-800 font-mono">${date}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Transaction Reference:</span>
          <span class="font-bold text-gray-800">${ref}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Transaction Value:</span>
          <span class="font-bold text-gray-850 font-mono text-base">Rs. ${amount.toLocaleString()}</span>
        </div>
      </div>

      <div class="mt-12 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-4">
        Computer-generated business record. No physical signature required.
      </div>
    </div>
  `;

  window.print();
}
