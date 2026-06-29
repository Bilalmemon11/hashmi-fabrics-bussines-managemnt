import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Product, Customer, Vendor, Invoice, Purchase, Expense, ApiResponse } from "../types";

export interface AlertMessage {
  type: "success" | "error";
  text: string;
}

interface AppContextType {
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
  invoices: Invoice[];
  purchases: Purchase[];
  expenses: Expense[];
  
  loading: Record<string, boolean>;
  alert: AlertMessage | null;
  setAlert: (alert: AlertMessage | null) => void;
  showAlert: (text: string, type?: "success" | "error") => void;
  
  printData: any | null;
  setPrintData: (data: any | null) => void;
  triggerPrint: (data: any) => void;
  
  refreshAll: () => Promise<void>;
  
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<boolean>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt" | "balance" | "total_purchase">) => Promise<boolean>;
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: number) => Promise<boolean>;
  receivePayment: (id: number, amount: number, date?: string) => Promise<boolean>;
  
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt" | "balance" | "total_purchase">) => Promise<boolean>;
  updateVendor: (id: number, vendor: Partial<Vendor>) => Promise<boolean>;
  deleteVendor: (id: number) => Promise<boolean>;
  payVendor: (id: number, amount: number, notes?: string, date?: string) => Promise<boolean>;
  
  addInvoice: (invoice: {
    customer_id: number;
    date: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    balance: number;
    payment_type: "cash" | "credit";
    items: { product_id: number; qty: number; unit_price: number; total: number }[];
  }) => Promise<any | boolean>;
  deleteInvoice: (id: number) => Promise<boolean>;
  
  addPurchase: (purchase: Omit<Purchase, "id" | "po_no" | "createdAt" | "updatedAt">) => Promise<boolean>;
  deletePurchase: (id: number) => Promise<boolean>;
  
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<boolean>;
  deleteExpense: (id: number) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState<Record<string, boolean>>({
    products: false,
    customers: false,
    vendors: false,
    invoices: false,
    purchases: false,
    expenses: false,
    global: false,
  });

  const [alert, setAlertState] = useState<AlertMessage | null>(null);
  const [printData, setPrintData] = useState<any | null>(null);

  const showAlert = useCallback((text: string, type: "success" | "error" = "success") => {
    setAlertState({ text, type });
  }, []);

  const setAlert = useCallback((val: AlertMessage | null) => {
    setAlertState(val);
  }, []);

  const triggerPrint = useCallback((data: any) => {
    setPrintData(data);
    setTimeout(() => {
      window.print();
    }, 200);
  }, []);

  // Clear alert after 4 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlertState(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const fetchResources = useCallback(async (resource: string, setter: (data: any) => void) => {
    setLoading(prev => ({ ...prev, [resource]: true }));
    try {
      const res = await api.get<ApiResponse<any>>(`/${resource}`);
      if (res.data && res.data.success) {
        setter(res.data.data);
      }
    } catch (err: any) {
      console.error(`Error loading ${resource}:`, err);
      // Quietly log to avoid clutter
    } finally {
      setLoading(prev => ({ ...prev, [resource]: false }));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(prev => ({ ...prev, global: true }));
    try {
      await Promise.all([
        fetchResources("products", setProducts),
        fetchResources("customers", setCustomers),
        fetchResources("vendors", setVendors),
        fetchResources("invoices", setInvoices),
        fetchResources("purchases", setPurchases),
        fetchResources("expenses", setExpenses),
      ]);
    } catch (err) {
      console.error("Error refreshing all data:", err);
    } finally {
      setLoading(prev => ({ ...prev, global: false }));
    }
  }, [fetchResources]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Product Actions
  const addProduct = async (productData: any) => {
    try {
      const res = await api.post<ApiResponse<Product>>("/products", productData);
      if (res.data && res.data.success) {
        showAlert("Product added successfully", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to add product";
      showAlert(msg, "error");
      return false;
    }
  };

  const updateProduct = async (id: number, productData: any) => {
    try {
      const res = await api.put<ApiResponse<Product>>(`/products/${id}`, productData);
      if (res.data && res.data.success) {
        showAlert("Product updated successfully", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update product";
      showAlert(msg, "error");
      return false;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const res = await api.delete<ApiResponse<Product>>(`/products/${id}`);
      if (res.data && res.data.success) {
        showAlert("Product deleted successfully", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete product";
      showAlert(msg, "error");
      return false;
    }
  };

  // Customer Actions
  const addCustomer = async (customerData: any) => {
    try {
      const res = await api.post<ApiResponse<Customer>>("/customers", customerData);
      if (res.data && res.data.success) {
        showAlert("Customer registered successfully", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to register customer";
      showAlert(msg, "error");
      return false;
    }
  };

  const updateCustomer = async (id: number, customerData: any) => {
    try {
      const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, customerData);
      if (res.data && res.data.success) {
        showAlert("Customer details updated", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update customer";
      showAlert(msg, "error");
      return false;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const res = await api.delete<ApiResponse<Customer>>(`/customers/${id}`);
      if (res.data && res.data.success) {
        showAlert("Customer record removed", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete customer";
      showAlert(msg, "error");
      return false;
    }
  };

  const receivePayment = async (id: number, amount: number, date?: string) => {
    try {
      const res = await api.post<ApiResponse<Customer>>(`/customers/${id}/receive-payment`, { amount, date });
      if (res.data && res.data.success) {
        showAlert(`Successfully received Rs. ${amount.toLocaleString()}`, "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to process payment";
      showAlert(msg, "error");
      return false;
    }
  };

  // Vendor Actions
  const addVendor = async (vendorData: any) => {
    try {
      const res = await api.post<ApiResponse<Vendor>>("/vendors", vendorData);
      if (res.data && res.data.success) {
        showAlert("Vendor added successfully", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to add vendor";
      showAlert(msg, "error");
      return false;
    }
  };

  const updateVendor = async (id: number, vendorData: any) => {
    try {
      const res = await api.put<ApiResponse<Vendor>>(`/vendors/${id}`, vendorData);
      if (res.data && res.data.success) {
        showAlert("Vendor details updated", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update vendor";
      showAlert(msg, "error");
      return false;
    }
  };

  const deleteVendor = async (id: number) => {
    try {
      const res = await api.delete<ApiResponse<Vendor>>(`/vendors/${id}`);
      if (res.data && res.data.success) {
        showAlert("Vendor deleted successfully", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete vendor";
      showAlert(msg, "error");
      return false;
    }
  };

  const payVendor = async (id: number, amount: number, notes?: string, date?: string) => {
    try {
      const res = await api.post<ApiResponse<Vendor>>(`/vendors/${id}/pay`, { amount, notes, date });
      if (res.data && res.data.success) {
        showAlert(`Paid Rs. ${amount.toLocaleString()} to vendor`, "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to process vendor payment";
      showAlert(msg, "error");
      return false;
    }
  };

  // Invoice Actions
  const addInvoice = async (invoiceData: any) => {
    try {
      const res = await api.post<ApiResponse<Invoice>>("/invoices", invoiceData);
      if (res.data && res.data.success) {
        showAlert("Invoice created and stock updated", "success");
        await refreshAll();
        return res.data.data;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create invoice";
      showAlert(msg, "error");
      return false;
    }
  };

  const deleteInvoice = async (id: number) => {
    try {
      const res = await api.delete<ApiResponse<Invoice>>(`/invoices/${id}`);
      if (res.data && res.data.success) {
        showAlert("Invoice deleted and stock restored", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete invoice";
      showAlert(msg, "error");
      return false;
    }
  };

  // Purchase Actions
  const addPurchase = async (purchaseData: any) => {
    try {
      const res = await api.post<ApiResponse<Purchase>>("/purchases", purchaseData);
      if (res.data && res.data.success) {
        showAlert("Purchase logged and vendor balance updated", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to log purchase";
      showAlert(msg, "error");
      return false;
    }
  };

  const deletePurchase = async (id: number) => {
    try {
      const res = await api.delete<ApiResponse<Purchase>>(`/purchases/${id}`);
      if (res.data && res.data.success) {
        showAlert("Purchase record removed", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete purchase";
      showAlert(msg, "error");
      return false;
    }
  };

  // Expense Actions
  const addExpense = async (expenseData: any) => {
    try {
      const res = await api.post<ApiResponse<Expense>>("/expenses", expenseData);
      if (res.data && res.data.success) {
        showAlert("Expense recorded", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to log expense";
      showAlert(msg, "error");
      return false;
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      const res = await api.delete<ApiResponse<Expense>>(`/expenses/${id}`);
      if (res.data && res.data.success) {
        showAlert("Expense record deleted", "success");
        await refreshAll();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete expense";
      showAlert(msg, "error");
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        vendors,
        invoices,
        purchases,
        expenses,
        loading,
        alert,
        setAlert,
        showAlert,
        printData,
        setPrintData,
        triggerPrint,
        refreshAll,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        receivePayment,
        addVendor,
        updateVendor,
        deleteVendor,
        payVendor,
        addInvoice,
        deleteInvoice,
        addPurchase,
        deletePurchase,
        addExpense,
        deleteExpense,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
