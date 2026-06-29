export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock_qty: number;
  unit: string;
  reorder_level: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  type: "retail" | "wholesale";
  balance: number;
  total_purchase: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: number;
  name: string;
  phone: string | null;
  city: string | null;
  balance: number;
  total_purchase: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  customer_id: number;
  customer_name?: string;
  date: string;
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  payment_type: "cash" | "credit";
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItemDetail[];
}

export interface InvoiceItemDetail {
  id: number;
  invoice_id: number;
  product_id: number;
  product_name: string;
  qty: number;
  unit_price: number;
  total: number;
}

export interface Purchase {
  id: number;
  po_no: string;
  vendor_id: number;
  vendor_name?: string;
  date: string;
  items_description: string | null;
  total: number;
  paid: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPayment {
  id: number;
  vendor_id: number;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPayment {
  id: number;
  customer_id: number;
  invoice_id: number | null;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  total_sales: number;
  cash_collected: number;
  customer_udhar: number;
  vendor_payable: number;
  total_expenses: number;
  low_stock_products: Product[];
  todays_invoices: (Invoice & { customer_name: string })[];
  recent_invoices: (Invoice & { customer_name: string })[];
  vendor_dues: Vendor[];
  customer_dues: Customer[];
  expense_by_category: { category: string; amount: number }[];
}

export interface ProfitLossData {
  total_revenue: number;
  total_cogs: number;
  gross_profit: number;
  total_expenses: number;
  net_profit: number;
  gross_margin_pct: number;
  net_margin_pct: number;
  expense_ratio_pct: number;
  cogs_ratio_pct: number;
  expense_breakdown: { category: string; amount: number }[];
  weekly_avg: {
    revenue: number;
    cogs: number;
    gross_profit: number;
    expenses: number;
    net_profit: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
