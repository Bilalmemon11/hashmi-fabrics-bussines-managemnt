import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Sidebar } from "./components/Sidebar";

// Page imports
import { Dashboard } from "./pages/Dashboard";
import { Invoices } from "./pages/Invoices";
import { Customers } from "./pages/Customers";
import { Products } from "./pages/Products";
import { Inventory } from "./pages/Inventory";
import { Vendors } from "./pages/Vendors";
import { Purchases } from "./pages/Purchases";
import { Expenses } from "./pages/Expenses";
import { Reports } from "./pages/Reports";
import { ProfitLoss } from "./pages/ProfitLoss";

import { useApp } from "./context/AppContext";
import { PrintTemplate } from "./components/PrintTemplate";

function AppContent() {
  const { printData } = useApp();

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#0f1117] overflow-hidden">
        {/* Left Persistent Navigation Rail */}
        <Sidebar />

        {/* Right Main Scrollable View Stage */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profit-loss" element={<ProfitLoss />} />
            
            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* Hidden print template rendered here, only visible in @media print */}
      <PrintTemplate data={printData} />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
