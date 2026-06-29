import express from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Check if PHP and MySQL are available
try {
  const phpVersion = execSync("php -v", { encoding: "utf-8" });
  fs.writeFileSync(path.join(process.cwd(), "php_check.txt"), "PHP IS AVAILABLE:\n" + phpVersion);
} catch (e: any) {
  fs.writeFileSync(path.join(process.cwd(), "php_check.txt"), "PHP IS NOT AVAILABLE:\n" + e.message);
}

app.use(express.json());

// --- DATABASE TYPE DEFINITIONS ---
interface Product {
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

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  type: "retail" | "wholesale";
  balance: number;
  total_purchase: number;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: number;
  name: string;
  phone: string | null;
  city: string | null;
  balance: number;
  total_purchase: number;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: number;
  invoice_no: string;
  customer_id: number;
  date: string;
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  payment_type: "cash" | "credit";
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number;
  qty: number;
  unit_price: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface Purchase {
  id: number;
  po_no: string;
  vendor_id: number;
  date: string;
  items_description: string | null;
  total: number;
  paid: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  id: number;
  date: string;
  category: string;
  description: string | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface VendorPayment {
  id: number;
  vendor_id: number;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CustomerPayment {
  id: number;
  customer_id: number;
  invoice_id: number | null;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
  invoices: Invoice[];
  invoice_items: InvoiceItem[];
  purchases: Purchase[];
  expenses: Expense[];
  vendor_payments: VendorPayment[];
  customer_payments: CustomerPayment[];
}

// --- DB STORAGE IMPLEMENTATION ---
function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(getInitialSeedData());
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file:", error);
    return getInitialSeedData();
  }
}

function writeDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Generate seeded data matching user requirements
function getInitialSeedData(): DatabaseSchema {
  const now = new Date().toISOString();
  
  // Seed Products
  const products: Product[] = [
    { id: 1, name: "Lawn Fabric 3m", category: "Lawn", price: 850, cost_price: 550, stock_qty: 45, unit: "meters", reorder_level: 10, createdAt: now, updatedAt: now },
    { id: 2, name: "Khaddar Suit Piece", category: "Khaddar", price: 1200, cost_price: 750, stock_qty: 28, unit: "pcs", reorder_level: 8, createdAt: now, updatedAt: now },
    { id: 3, name: "Chiffon Dupatta", category: "Chiffon", price: 650, cost_price: 380, stock_qty: 62, unit: "pcs", reorder_level: 15, createdAt: now, updatedAt: now },
    { id: 4, name: "Cotton Shirting 5m", category: "Cotton", price: 1100, cost_price: 680, stock_qty: 7, unit: "meters", reorder_level: 10, createdAt: now, updatedAt: now },
    { id: 5, name: "Silk Fabric 2m", category: "Silk", price: 2200, cost_price: 1500, stock_qty: 18, unit: "meters", reorder_level: 5, createdAt: now, updatedAt: now },
    { id: 6, name: "Embroidered Panel", category: "Embroidery", price: 3500, cost_price: 2200, stock_qty: 12, unit: "pcs", reorder_level: 4, createdAt: now, updatedAt: now }
  ];

  // Seed Customers
  const customers: Customer[] = [
    { id: 1, name: "Ayesha Khan", phone: "0300-1234567", type: "retail", balance: 0, total_purchase: 12500, createdAt: now, updatedAt: now },
    { id: 2, name: "Fatima Traders", phone: "0321-9876543", type: "wholesale", balance: 8500, total_purchase: 48000, createdAt: now, updatedAt: now },
    { id: 3, name: "Zubaida Begum", phone: "0333-5557890", type: "retail", balance: 2200, total_purchase: 7800, createdAt: now, updatedAt: now },
    { id: 4, name: "Style Point Shop", phone: "0312-4443321", type: "wholesale", balance: 15000, total_purchase: 95000, createdAt: now, updatedAt: now },
    { id: 5, name: "Nazia Textile", phone: "0345-1119988", type: "wholesale", balance: 0, total_purchase: 32000, createdAt: now, updatedAt: now }
  ];

  // Seed Vendors
  const vendors: Vendor[] = [
    { id: 1, name: "Al-Rehman Cloth House", phone: "042-3456789", city: "Lahore", balance: 22000, total_purchase: 150000, createdAt: now, updatedAt: now },
    { id: 2, name: "Chenab Fabrics", phone: "041-7788990", city: "Faisalabad", balance: 0, total_purchase: 85000, createdAt: now, updatedAt: now },
    { id: 3, name: "Karachi Silk Mills", phone: "021-3344556", city: "Karachi", balance: 45000, total_purchase: 220000, createdAt: now, updatedAt: now },
    { id: 4, name: "Punjab Weaving Co", phone: "042-9988776", city: "Lahore", balance: 8500, total_purchase: 65000, createdAt: now, updatedAt: now }
  ];

  // Seed some historic Expenses, Invoices, Purchases to make charts/dashboard gorgeous on initial load
  const todayDate = new Date().toISOString().split("T")[0];
  const lastMonthDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const twoMonthsAgoDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const expenses: Expense[] = [
    { id: 1, date: lastMonthDate, category: "Rent", description: "Shop monthly rent", amount: 25000, createdAt: now, updatedAt: now },
    { id: 2, date: lastMonthDate, category: "Salary", description: "Staff wages", amount: 18000, createdAt: now, updatedAt: now },
    { id: 3, date: todayDate, category: "Electricity", description: "Utility bill June", amount: 6500, createdAt: now, updatedAt: now },
    { id: 4, date: todayDate, category: "Transport", description: "Bazar carriage charges", amount: 2400, createdAt: now, updatedAt: now }
  ];

  const invoices: Invoice[] = [
    { id: 1, invoice_no: "INV-0001", customer_id: 1, date: twoMonthsAgoDate, subtotal: 3400, discount: 200, total: 3200, paid: 3200, balance: 0, payment_type: "cash", createdAt: now, updatedAt: now },
    { id: 2, invoice_no: "INV-0002", customer_id: 2, date: lastMonthDate, subtotal: 18500, discount: 500, total: 18000, paid: 9500, balance: 8500, payment_type: "credit", createdAt: now, updatedAt: now },
    { id: 3, invoice_no: "INV-0003", customer_id: 3, date: lastMonthDate, subtotal: 5400, discount: 0, total: 5400, paid: 3200, balance: 2200, payment_type: "credit", createdAt: now, updatedAt: now },
    { id: 4, invoice_no: "INV-0004", customer_id: 4, date: todayDate, subtotal: 35000, discount: 1000, total: 34000, paid: 19000, balance: 15000, payment_type: "credit", createdAt: now, updatedAt: now }
  ];

  const invoice_items: InvoiceItem[] = [
    { id: 1, invoice_id: 1, product_id: 1, qty: 4, unit_price: 850, total: 3400, createdAt: now, updatedAt: now },
    { id: 2, invoice_id: 2, product_id: 2, qty: 10, unit_price: 1200, total: 12000, createdAt: now, updatedAt: now },
    { id: 3, invoice_id: 2, product_id: 3, qty: 10, unit_price: 650, total: 6500, createdAt: now, updatedAt: now },
    { id: 4, invoice_id: 3, product_id: 5, qty: 2, unit_price: 2200, total: 4400, createdAt: now, updatedAt: now },
    { id: 5, invoice_id: 3, product_id: 4, qty: 1, unit_price: 1000, total: 1000, createdAt: now, updatedAt: now },
    { id: 6, invoice_id: 4, product_id: 6, qty: 10, unit_price: 3500, total: 35000, createdAt: now, updatedAt: now }
  ];

  const purchases: Purchase[] = [
    { id: 1, po_no: "PUR-0001", vendor_id: 1, date: lastMonthDate, items_description: "Bulk Lawn and Cotton Fabric roll purchase", total: 45000, paid: 23000, balance: 22000, createdAt: now, updatedAt: now },
    { id: 2, po_no: "PUR-0002", vendor_id: 3, date: todayDate, items_description: "Silk rolls high margin", total: 75000, paid: 30000, balance: 45000, createdAt: now, updatedAt: now },
    { id: 3, po_no: "PUR-0003", vendor_id: 4, date: todayDate, items_description: "Weaving yarn and samples", total: 12500, paid: 4000, balance: 8500, createdAt: now, updatedAt: now }
  ];

  const vendor_payments: VendorPayment[] = [
    { id: 1, vendor_id: 1, amount: 23000, date: lastMonthDate, notes: "Advance deposit for Lawn rolls", createdAt: now, updatedAt: now },
    { id: 2, vendor_id: 3, amount: 30000, date: todayDate, notes: "Partial cash payment for Silk", createdAt: now, updatedAt: now }
  ];

  const customer_payments: CustomerPayment[] = [
    { id: 1, customer_id: 1, invoice_id: 1, amount: 3200, date: twoMonthsAgoDate, createdAt: now, updatedAt: now },
    { id: 2, customer_id: 2, invoice_id: 2, amount: 9500, date: lastMonthDate, createdAt: now, updatedAt: now },
    { id: 3, customer_id: 3, invoice_id: 3, amount: 3200, date: lastMonthDate, createdAt: now, updatedAt: now },
    { id: 4, customer_id: 4, invoice_id: 4, amount: 19000, date: todayDate, createdAt: now, updatedAt: now }
  ];

  return {
    products,
    customers,
    vendors,
    invoices,
    invoice_items,
    purchases,
    expenses,
    vendor_payments,
    customer_payments
  };
}

// Helper response formatting functions
function successResponse(res: any, data: any, message = "Done") {
  return res.json({
    success: true,
    data,
    message
  });
}

function errorResponse(res: any, message: string, status = 400) {
  return res.status(status).json({
    success: false,
    message
  });
}

// --- API ENDPOINTS ---

// 1. Dashboard Controller
app.get("/api/v1/dashboard", (req, res) => {
  try {
    const db = readDB();
    const today = new Date().toISOString().split("T")[0];

    const total_sales = db.invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const cash_collected = db.invoices.reduce((sum, inv) => sum + Number(inv.paid), 0) + 
                           db.customer_payments.reduce((sum, pay) => pay.invoice_id === null ? sum + Number(pay.amount) : sum, 0); // Include direct cash payments
    
    const customer_udhar = db.customers.reduce((sum, cust) => sum + Number(cust.balance), 0);
    const vendor_payable = db.vendors.reduce((sum, vend) => sum + Number(vend.balance), 0);
    const total_expenses = db.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const low_stock_products = db.products.filter(p => p.stock_qty <= p.reorder_level);
    
    // Todays invoices with customer name
    const todays_invoices = db.invoices
      .filter(inv => inv.date === today)
      .map(inv => {
        const customer = db.customers.find(c => c.id === inv.customer_id);
        return {
          ...inv,
          customer_name: customer ? customer.name : "Walk-in Customer"
        };
      });

    // Recent invoices (last 5 with customer name)
    const recent_invoices = [...db.invoices]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(inv => {
        const customer = db.customers.find(c => c.id === inv.customer_id);
        return {
          ...inv,
          customer_name: customer ? customer.name : "Walk-in Customer"
        };
      });

    // Vendor dues
    const vendor_dues = db.vendors.filter(v => v.balance > 0);
    
    // Customer dues
    const customer_dues = db.customers.filter(c => c.balance > 0);

    // Expense by category
    const expense_by_cat_map: Record<string, number> = {};
    db.expenses.forEach(exp => {
      expense_by_cat_map[exp.category] = (expense_by_cat_map[exp.category] || 0) + Number(exp.amount);
    });
    const expense_by_category = Object.keys(expense_by_cat_map).map(cat => ({
      category: cat,
      amount: expense_by_cat_map[cat]
    }));

    return successResponse(res, {
      total_sales,
      cash_collected,
      customer_udhar,
      vendor_payable,
      total_expenses,
      low_stock_products,
      todays_invoices,
      recent_invoices,
      vendor_dues,
      customer_dues,
      expense_by_category
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// 2. Product Controller
app.get("/api/v1/products", (req, res) => {
  try {
    const db = readDB();
    const sorted = [...db.products].sort((a, b) => a.name.localeCompare(b.name));
    return successResponse(res, sorted);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.post("/api/v1/products", (req, res) => {
  try {
    const db = readDB();
    const { name, category, price, cost_price, stock_qty, unit, reorder_level } = req.body;
    
    if (!name) return errorResponse(res, "Product name is required");

    const newProduct: Product = {
      id: db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1,
      name,
      category: category || "Other",
      price: Number(price) || 0,
      cost_price: Number(cost_price) || 0,
      stock_qty: Number(stock_qty) || 0,
      unit: unit || "pcs",
      reorder_level: Number(reorder_level) || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.push(newProduct);
    writeDB(db);
    return successResponse(res, newProduct, "Product created successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.get("/api/v1/products/:id", (req, res) => {
  try {
    const db = readDB();
    const product = db.products.find(p => p.id === Number(req.params.id));
    if (!product) return errorResponse(res, "Product not found", 404);
    return successResponse(res, product);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.put("/api/v1/products/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return errorResponse(res, "Product not found", 404);

    const { name, category, price, cost_price, stock_qty, unit, reorder_level } = req.body;
    if (!name) return errorResponse(res, "Product name is required");

    db.products[index] = {
      ...db.products[index],
      name,
      category: category || db.products[index].category,
      price: price !== undefined ? Number(price) : db.products[index].price,
      cost_price: cost_price !== undefined ? Number(cost_price) : db.products[index].cost_price,
      stock_qty: stock_qty !== undefined ? Number(stock_qty) : db.products[index].stock_qty,
      unit: unit || db.products[index].unit,
      reorder_level: reorder_level !== undefined ? Number(reorder_level) : db.products[index].reorder_level,
      updatedAt: new Date().toISOString()
    };

    writeDB(db);
    return successResponse(res, db.products[index], "Product updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.delete("/api/v1/products/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return errorResponse(res, "Product not found", 404);

    // Remove product
    const deleted = db.products.splice(index, 1);
    writeDB(db);
    return successResponse(res, deleted[0], "Product deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// 3. Customer Controller
app.get("/api/v1/customers", (req, res) => {
  try {
    const db = readDB();
    return successResponse(res, db.customers);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.post("/api/v1/customers", (req, res) => {
  try {
    const db = readDB();
    const { name, phone, type, balance, total_purchase } = req.body;
    if (!name) return errorResponse(res, "Customer name is required");

    const newCustomer: Customer = {
      id: db.customers.length > 0 ? Math.max(...db.customers.map(c => c.id)) + 1 : 1,
      name,
      phone: phone || null,
      type: type || "retail",
      balance: Number(balance) || 0,
      total_purchase: Number(total_purchase) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.customers.push(newCustomer);
    writeDB(db);
    return successResponse(res, newCustomer, "Customer created successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.get("/api/v1/customers/:id", (req, res) => {
  try {
    const db = readDB();
    const customer = db.customers.find(c => c.id === Number(req.params.id));
    if (!customer) return errorResponse(res, "Customer not found", 404);

    // Get customer invoices
    const invoices = db.invoices.filter(i => i.customer_id === customer.id);
    const payments = db.customer_payments.filter(p => p.customer_id === customer.id);

    return successResponse(res, {
      ...customer,
      invoices,
      payments
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.put("/api/v1/customers/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.customers.findIndex(c => c.id === id);
    if (index === -1) return errorResponse(res, "Customer not found", 404);

    const { name, phone, type, balance, total_purchase } = req.body;
    if (!name) return errorResponse(res, "Customer name is required");

    db.customers[index] = {
      ...db.customers[index],
      name,
      phone: phone !== undefined ? phone : db.customers[index].phone,
      type: type || db.customers[index].type,
      balance: balance !== undefined ? Number(balance) : db.customers[index].balance,
      total_purchase: total_purchase !== undefined ? Number(total_purchase) : db.customers[index].total_purchase,
      updatedAt: new Date().toISOString()
    };

    writeDB(db);
    return successResponse(res, db.customers[index], "Customer updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.delete("/api/v1/customers/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.customers.findIndex(c => c.id === id);
    if (index === -1) return errorResponse(res, "Customer not found", 404);

    const deleted = db.customers.splice(index, 1);
    writeDB(db);
    return successResponse(res, deleted[0], "Customer deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.post("/api/v1/customers/:id/receive-payment", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const customerIndex = db.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) return errorResponse(res, "Customer not found", 404);

    const { amount, date } = req.body;
    if (!amount || Number(amount) <= 0) {
      return errorResponse(res, "Invalid payment amount");
    }

    const payAmt = Number(amount);
    
    // Deduct from customer balance
    db.customers[customerIndex].balance = Math.max(0, db.customers[customerIndex].balance - payAmt);
    db.customers[customerIndex].updatedAt = new Date().toISOString();

    // Create Customer Payment record
    const newPayment: CustomerPayment = {
      id: db.customer_payments.length > 0 ? Math.max(...db.customer_payments.map(p => p.id)) + 1 : 1,
      customer_id: id,
      invoice_id: null,
      amount: payAmt,
      date: date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.customer_payments.push(newPayment);
    writeDB(db);

    return successResponse(res, db.customers[customerIndex], "Payment received successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// 4. Vendor Controller
app.get("/api/v1/vendors", (req, res) => {
  try {
    const db = readDB();
    return successResponse(res, db.vendors);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.post("/api/v1/vendors", (req, res) => {
  try {
    const db = readDB();
    const { name, phone, city, balance, total_purchase } = req.body;
    if (!name) return errorResponse(res, "Vendor name is required");

    const newVendor: Vendor = {
      id: db.vendors.length > 0 ? Math.max(...db.vendors.map(v => v.id)) + 1 : 1,
      name,
      phone: phone || null,
      city: city || null,
      balance: Number(balance) || 0,
      total_purchase: Number(total_purchase) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.vendors.push(newVendor);
    writeDB(db);
    return successResponse(res, newVendor, "Vendor created successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.get("/api/v1/vendors/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const vendor = db.vendors.find(v => v.id === id);
    if (!vendor) return errorResponse(res, "Vendor not found", 404);

    const purchases = db.purchases.filter(p => p.vendor_id === id);
    const payments = db.vendor_payments.filter(p => p.vendor_id === id);

    return successResponse(res, {
      ...vendor,
      purchases,
      payments
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.put("/api/v1/vendors/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.vendors.findIndex(v => v.id === id);
    if (index === -1) return errorResponse(res, "Vendor not found", 404);

    const { name, phone, city, balance, total_purchase } = req.body;
    if (!name) return errorResponse(res, "Vendor name is required");

    db.vendors[index] = {
      ...db.vendors[index],
      name,
      phone: phone !== undefined ? phone : db.vendors[index].phone,
      city: city !== undefined ? city : db.vendors[index].city,
      balance: balance !== undefined ? Number(balance) : db.vendors[index].balance,
      total_purchase: total_purchase !== undefined ? Number(total_purchase) : db.vendors[index].total_purchase,
      updatedAt: new Date().toISOString()
    };

    writeDB(db);
    return successResponse(res, db.vendors[index], "Vendor updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.delete("/api/v1/vendors/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.vendors.findIndex(v => v.id === id);
    if (index === -1) return errorResponse(res, "Vendor not found", 404);

    const deleted = db.vendors.splice(index, 1);
    writeDB(db);
    return successResponse(res, deleted[0], "Vendor deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.post("/api/v1/vendors/:id/pay", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const vendorIndex = db.vendors.findIndex(v => v.id === id);
    if (vendorIndex === -1) return errorResponse(res, "Vendor not found", 404);

    const { amount, date, notes } = req.body;
    if (!amount || Number(amount) <= 0) {
      return errorResponse(res, "Invalid payment amount");
    }

    const payAmt = Number(amount);

    // Deduct from vendor balance
    db.vendors[vendorIndex].balance = Math.max(0, db.vendors[vendorIndex].balance - payAmt);
    db.vendors[vendorIndex].updatedAt = new Date().toISOString();

    // Create Vendor Payment record
    const newPayment: VendorPayment = {
      id: db.vendor_payments.length > 0 ? Math.max(...db.vendor_payments.map(p => p.id)) + 1 : 1,
      vendor_id: id,
      amount: payAmt,
      date: date || new Date().toISOString().split("T")[0],
      notes: notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.vendor_payments.push(newPayment);
    writeDB(db);

    return successResponse(res, db.vendors[vendorIndex], "Vendor payment processed successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// 5. Invoice Controller
app.get("/api/v1/invoices", (req, res) => {
  try {
    const db = readDB();
    // Latest first
    const invoicesWithCustomer = db.invoices
      .map(inv => {
        const customer = db.customers.find(c => c.id === inv.customer_id);
        return {
          ...inv,
          customer_name: customer ? customer.name : "Walk-in Customer"
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return successResponse(res, invoicesWithCustomer);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.post("/api/v1/invoices", (req, res) => {
  try {
    const db = readDB();
    const { customer_id, date, subtotal, discount, total, paid, balance, payment_type, items } = req.body;

    if (!customer_id) return errorResponse(res, "Customer is required");
    if (!items || !Array.isArray(items) || items.length === 0) return errorResponse(res, "At least one item is required");

    // Generate Invoice Number INV-XXXX
    const invoiceCount = db.invoices.length;
    const nextNum = String(invoiceCount + 1).padStart(4, "0");
    const invoice_no = `INV-${nextNum}`;

    const parsedSubtotal = Number(subtotal) || 0;
    const parsedDiscount = Number(discount) || 0;
    const parsedTotal = Number(total) || 0;
    const parsedPaid = Number(paid) || 0;
    const parsedBalance = Number(balance) || 0;

    // Create Invoice Record
    const newInvoice: Invoice = {
      id: db.invoices.length > 0 ? Math.max(...db.invoices.map(i => i.id)) + 1 : 1,
      invoice_no,
      customer_id: Number(customer_id),
      date: date || new Date().toISOString().split("T")[0],
      subtotal: parsedSubtotal,
      discount: parsedDiscount,
      total: parsedTotal,
      paid: parsedPaid,
      balance: parsedBalance,
      payment_type: payment_type || "cash",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.invoices.push(newInvoice);

    // Save invoice items & deduct stock
    items.forEach((item: any) => {
      const pId = Number(item.product_id);
      const q = Number(item.qty);
      const pr = Number(item.unit_price);
      
      const newInvoiceItem: InvoiceItem = {
        id: db.invoice_items.length > 0 ? Math.max(...db.invoice_items.map(ii => ii.id)) + 1 : 1,
        invoice_id: newInvoice.id,
        product_id: pId,
        qty: q,
        unit_price: pr,
        total: Number(item.total) || (q * pr),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.invoice_items.push(newInvoiceItem);

      // Decrement product stock
      const productIndex = db.products.findIndex(p => p.id === pId);
      if (productIndex !== -1) {
        db.products[productIndex].stock_qty = Math.max(0, db.products[productIndex].stock_qty - q);
        db.products[productIndex].updatedAt = new Date().toISOString();
      }
    });

    // Update Customer state
    const customerIndex = db.customers.findIndex(c => c.id === Number(customer_id));
    if (customerIndex !== -1) {
      db.customers[customerIndex].balance = db.customers[customerIndex].balance + parsedBalance;
      db.customers[customerIndex].total_purchase = db.customers[customerIndex].total_purchase + parsedTotal;
      db.customers[customerIndex].updatedAt = new Date().toISOString();
    }

    // Create Customer payment record if paid > 0
    if (parsedPaid > 0) {
      const newPayment: CustomerPayment = {
        id: db.customer_payments.length > 0 ? Math.max(...db.customer_payments.map(p => p.id)) + 1 : 1,
        customer_id: Number(customer_id),
        invoice_id: newInvoice.id,
        amount: parsedPaid,
        date: date || new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.customer_payments.push(newPayment);
    }

    writeDB(db);

    const customer = db.customers.find(c => c.id === Number(customer_id));
    const itemsWithProductDetails = db.invoice_items
      .filter(ii => ii.invoice_id === newInvoice.id)
      .map(ii => {
        const product = db.products.find(p => p.id === ii.product_id);
        return {
          ...ii,
          product_name: product ? product.name : "Unknown Product"
        };
      });

    return successResponse(res, {
      ...newInvoice,
      customer_name: customer ? customer.name : "Walk-in Customer",
      items: itemsWithProductDetails
    }, "Invoice saved successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.get("/api/v1/invoices/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const invoice = db.invoices.find(i => i.id === id);
    if (!invoice) return errorResponse(res, "Invoice not found", 404);

    const customer = db.customers.find(c => c.id === invoice.customer_id);
    const items = db.invoice_items
      .filter(ii => ii.invoice_id === id)
      .map(ii => {
        const product = db.products.find(p => p.id === ii.product_id);
        return {
          ...ii,
          product_name: product ? product.name : "Unknown Product"
        };
      });

    return successResponse(res, {
      ...invoice,
      customer_name: customer ? customer.name : "Walk-in Customer",
      customer_phone: customer ? customer.phone : null,
      items
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.delete("/api/v1/invoices/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const invoiceIndex = db.invoices.findIndex(i => i.id === id);
    if (invoiceIndex === -1) return errorResponse(res, "Invoice not found", 404);

    const invoice = db.invoices[invoiceIndex];
    const today = new Date().toISOString().split("T")[0];

    // Check if invoice date is same day
    if (invoice.date !== today) {
      return errorResponse(res, "Only invoices created today can be deleted");
    }

    // Revert customer balance and total purchases
    const customerIndex = db.customers.findIndex(c => c.id === invoice.customer_id);
    if (customerIndex !== -1) {
      db.customers[customerIndex].balance = Math.max(0, db.customers[customerIndex].balance - invoice.balance);
      db.customers[customerIndex].total_purchase = Math.max(0, db.customers[customerIndex].total_purchase - invoice.total);
      db.customers[customerIndex].updatedAt = new Date().toISOString();
    }

    // Revert products stock
    const items = db.invoice_items.filter(ii => ii.invoice_id === id);
    items.forEach(ii => {
      const productIndex = db.products.findIndex(p => p.id === ii.product_id);
      if (productIndex !== -1) {
        db.products[productIndex].stock_qty = db.products[productIndex].stock_qty + ii.qty;
        db.products[productIndex].updatedAt = new Date().toISOString();
      }
    });

    // Delete customer payments tied to this invoice
    db.customer_payments = db.customer_payments.filter(cp => cp.invoice_id !== id);

    // Delete invoice items
    db.invoice_items = db.invoice_items.filter(ii => ii.invoice_id !== id);

    // Delete invoice
    db.invoices.splice(invoiceIndex, 1);

    writeDB(db);
    return successResponse(res, invoice, "Invoice deleted and stock restored successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// 6. Purchase Controller
app.get("/api/v1/purchases", (req, res) => {
  try {
    const db = readDB();
    // Latest first
    const purchasesWithVendor = db.purchases
      .map(pur => {
        const vendor = db.vendors.find(v => v.id === pur.vendor_id);
        return {
          ...pur,
          vendor_name: vendor ? vendor.name : "Unknown Vendor"
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return successResponse(res, purchasesWithVendor);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.post("/api/v1/purchases", (req, res) => {
  try {
    const db = readDB();
    const { vendor_id, date, items_description, total, paid, balance } = req.body;

    if (!vendor_id) return errorResponse(res, "Vendor is required");

    const parsedTotal = Number(total) || 0;
    const parsedPaid = Number(paid) || 0;
    const parsedBalance = Number(balance) || 0;

    // Generate Purchase Order PO Number PUR-XXXX
    const poCount = db.purchases.length;
    const nextNum = String(poCount + 1).padStart(4, "0");
    const po_no = `PUR-${nextNum}`;

    const newPurchase: Purchase = {
      id: db.purchases.length > 0 ? Math.max(...db.purchases.map(p => p.id)) + 1 : 1,
      po_no,
      vendor_id: Number(vendor_id),
      date: date || new Date().toISOString().split("T")[0],
      items_description: items_description || null,
      total: parsedTotal,
      paid: parsedPaid,
      balance: parsedBalance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.purchases.push(newPurchase);

    // Increment vendor balance and purchase totals
    const vendorIndex = db.vendors.findIndex(v => v.id === Number(vendor_id));
    if (vendorIndex !== -1) {
      db.vendors[vendorIndex].balance = db.vendors[vendorIndex].balance + parsedBalance;
      db.vendors[vendorIndex].total_purchase = db.vendors[vendorIndex].total_purchase + parsedTotal;
      db.vendors[vendorIndex].updatedAt = new Date().toISOString();
    }

    // Create vendor payment record if paid > 0
    if (parsedPaid > 0) {
      const newPayment: VendorPayment = {
        id: db.vendor_payments.length > 0 ? Math.max(...db.vendor_payments.map(p => p.id)) + 1 : 1,
        vendor_id: Number(vendor_id),
        amount: parsedPaid,
        date: date || new Date().toISOString().split("T")[0],
        notes: `Paid at purchase of PO: ${po_no}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.vendor_payments.push(newPayment);
    }

    writeDB(db);
    return successResponse(res, newPurchase, "Purchase order saved successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.get("/api/v1/purchases/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const purchase = db.purchases.find(p => p.id === id);
    if (!purchase) return errorResponse(res, "Purchase not found", 404);

    const vendor = db.vendors.find(v => v.id === purchase.vendor_id);
    return successResponse(res, {
      ...purchase,
      vendor_name: vendor ? vendor.name : "Unknown Vendor"
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.put("/api/v1/purchases/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.purchases.findIndex(p => p.id === id);
    if (index === -1) return errorResponse(res, "Purchase not found", 404);

    const { vendor_id, date, items_description, total, paid, balance } = req.body;
    if (!vendor_id) return errorResponse(res, "Vendor is required");

    const oldPurchase = db.purchases[index];
    const oldBalanceDiff = Number(balance) - oldPurchase.balance;
    const oldTotalDiff = Number(total) - oldPurchase.total;

    // Update vendor details with difference
    const vendorIndex = db.vendors.findIndex(v => v.id === oldPurchase.vendor_id);
    if (vendorIndex !== -1) {
      db.vendors[vendorIndex].balance = Math.max(0, db.vendors[vendorIndex].balance + oldBalanceDiff);
      db.vendors[vendorIndex].total_purchase = Math.max(0, db.vendors[vendorIndex].total_purchase + oldTotalDiff);
      db.vendors[vendorIndex].updatedAt = new Date().toISOString();
    }

    db.purchases[index] = {
      ...db.purchases[index],
      vendor_id: Number(vendor_id),
      date: date || db.purchases[index].date,
      items_description: items_description !== undefined ? items_description : db.purchases[index].items_description,
      total: Number(total),
      paid: Number(paid),
      balance: Number(balance),
      updatedAt: new Date().toISOString()
    };

    writeDB(db);
    return successResponse(res, db.purchases[index], "Purchase updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.delete("/api/v1/purchases/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.purchases.findIndex(p => p.id === id);
    if (index === -1) return errorResponse(res, "Purchase not found", 404);

    const purchase = db.purchases[index];

    // Deduct vendor balance
    const vendorIndex = db.vendors.findIndex(v => v.id === purchase.vendor_id);
    if (vendorIndex !== -1) {
      db.vendors[vendorIndex].balance = Math.max(0, db.vendors[vendorIndex].balance - purchase.balance);
      db.vendors[vendorIndex].total_purchase = Math.max(0, db.vendors[vendorIndex].total_purchase - purchase.total);
      db.vendors[vendorIndex].updatedAt = new Date().toISOString();
    }

    db.purchases.splice(index, 1);
    writeDB(db);
    return successResponse(res, purchase, "Purchase deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// 7. Expense Controller
app.get("/api/v1/expenses", (req, res) => {
  try {
    const db = readDB();
    const sorted = [...db.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return successResponse(res, sorted);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.post("/api/v1/expenses", (req, res) => {
  try {
    const db = readDB();
    const { date, category, description, amount } = req.body;

    if (!category) return errorResponse(res, "Expense category is required");
    if (!amount || Number(amount) <= 0) return errorResponse(res, "Valid expense amount is required");

    const newExpense: Expense = {
      id: db.expenses.length > 0 ? Math.max(...db.expenses.map(e => e.id)) + 1 : 1,
      date: date || new Date().toISOString().split("T")[0],
      category,
      description: description || null,
      amount: Number(amount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.expenses.push(newExpense);
    writeDB(db);
    return successResponse(res, newExpense, "Expense added successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.get("/api/v1/expenses/:id", (req, res) => {
  try {
    const db = readDB();
    const exp = db.expenses.find(e => e.id === Number(req.params.id));
    if (!exp) return errorResponse(res, "Expense not found", 404);
    return successResponse(res, exp);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.put("/api/v1/expenses/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.expenses.findIndex(e => e.id === id);
    if (index === -1) return errorResponse(res, "Expense not found", 404);

    const { date, category, description, amount } = req.body;
    if (!category) return errorResponse(res, "Expense category is required");

    db.expenses[index] = {
      ...db.expenses[index],
      date: date || db.expenses[index].date,
      category,
      description: description !== undefined ? description : db.expenses[index].description,
      amount: Number(amount),
      updatedAt: new Date().toISOString()
    };

    writeDB(db);
    return successResponse(res, db.expenses[index], "Expense updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.delete("/api/v1/expenses/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.expenses.findIndex(e => e.id === id);
    if (index === -1) return errorResponse(res, "Expense not found", 404);

    const deleted = db.expenses.splice(index, 1);
    writeDB(db);
    return successResponse(res, deleted[0], "Expense deleted successfully");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// 8. Reports Controller
app.get("/api/v1/reports/profit-loss", (req, res) => {
  try {
    const db = readDB();

    const total_revenue = db.invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    
    // Calculate COGS = sum of (invoice_items qty * product cost_price)
    let total_cogs = 0;
    db.invoice_items.forEach(ii => {
      const product = db.products.find(p => p.id === ii.product_id);
      const cost = product ? Number(product.cost_price) : 0;
      total_cogs += ii.qty * cost;
    });

    const gross_profit = total_revenue - total_cogs;
    const total_expenses = db.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const net_profit = gross_profit - total_expenses;

    const gross_margin_pct = total_revenue > 0 ? (gross_profit / total_revenue) * 100 : 0;
    const net_margin_pct = total_revenue > 0 ? (net_profit / total_revenue) * 100 : 0;
    const expense_ratio_pct = total_revenue > 0 ? (total_expenses / total_revenue) * 100 : 0;
    const cogs_ratio_pct = total_revenue > 0 ? (total_cogs / total_revenue) * 100 : 0;

    // Expense breakdown grouped by category
    const expBreakdownMap: Record<string, number> = {};
    db.expenses.forEach(exp => {
      expBreakdownMap[exp.category] = (expBreakdownMap[exp.category] || 0) + Number(exp.amount);
    });
    const expense_breakdown = Object.keys(expBreakdownMap).map(cat => ({
      category: cat,
      amount: expBreakdownMap[cat]
    }));

    // Weekly Averages
    const weekly_avg = {
      revenue: total_revenue / 4,
      cogs: total_cogs / 4,
      gross_profit: gross_profit / 4,
      expenses: total_expenses / 4,
      net_profit: net_profit / 4
    };

    return successResponse(res, {
      total_revenue,
      total_cogs,
      gross_profit,
      total_expenses,
      net_profit,
      gross_margin_pct,
      net_margin_pct,
      expense_ratio_pct,
      cogs_ratio_pct,
      expense_breakdown,
      weekly_avg
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

app.get("/api/v1/reports/monthly-sales", (req, res) => {
  try {
    const db = readDB();

    // Group sales (invoices total) of the last 6 calendar months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result: { month: string; total: number }[] = [];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const year = d.getFullYear();
      
      // Calculate sales for this month-year combination
      const monthInvoices = db.invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === year;
      });

      const total = monthInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
      result.push({
        month: `${mName} ${year}`,
        total
      });
    }

    return successResponse(res, result);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});


// --- INTEGRATE VITE DEV SERVER OR STATIC SERVING ---

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
