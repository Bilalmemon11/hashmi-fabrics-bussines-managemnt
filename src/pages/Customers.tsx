import React, { useState } from "react";
import { Topbar } from "../components/Topbar";
import { StatCard } from "../components/StatCard";
import { Modal } from "../components/Modal";
import { useApp } from "../context/AppContext";
import { formatPKR, getInitials } from "../utils";
import {
  Users,
  TrendingUp,
  Receipt,
  Plus,
  Coins,
  ShieldCheck,
  Eye,
  Trash2,
} from "lucide-react";
import api from "../services/api";

export const Customers: React.FC = () => {
  const {
    customers,
    addCustomer,
    receivePayment,
    deleteCustomer,
    alert,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Active customer for sub-operations
  const [selectedCust, setSelectedCust] = useState<any | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"retail" | "wholesale">("retail");
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Calculations for Stats
  const customerCount = customers.length;
  const totalCustomerSales = customers.reduce((sum, c) => sum + c.total_purchase, 0);
  const totalCustomerUdhar = customers.reduce((sum, c) => sum + c.balance, 0);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const success = await addCustomer({
      name,
      phone: phone || null,
      type,
      // Pass initial balance as raw body param if needed, backend maps it beautifully
      balance: initialBalance,
      total_purchase: 0,
    } as any);

    if (success) {
      setName("");
      setPhone("");
      setType("retail");
      setInitialBalance(0);
      setIsAddModalOpen(false);
    }
  };

  const handleOpenReceivePayment = (cust: any) => {
    setSelectedCust(cust);
    setPayAmount(cust.balance);
    setPayDate(new Date().toISOString().split("T")[0]);
    setIsPayModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || payAmount <= 0) return;

    const success = await receivePayment(selectedCust.id, payAmount, payDate);
    if (success) {
      setIsPayModalOpen(false);
      setSelectedCust(null);
    }
  };

  const handleViewCustomer = async (id: number) => {
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data && res.data.success) {
        setSelectedCust(res.data.data);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (window.confirm("Are you sure you want to remove this customer record?")) {
      await deleteCustomer(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar
        title="Customers Ledger"
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#6c63ff] hover:bg-[#7c75ff] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 cursor-pointer"
          >
            <Plus size={16} /> Add Customer
          </button>
        }
      />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Stat Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Customers"
            value={customerCount}
            sub="Registered accounts"
            subColor="purple"
            icon={<Users size={18} />}
          />
          <StatCard
            label="Cumulative Customer Sales"
            value={formatPKR(totalCustomerSales)}
            sub="All-time purchase volume"
            subColor="green"
            icon={<TrendingUp size={18} />}
          />
          <StatCard
            label="Receivables Outstanding"
            value={formatPKR(totalCustomerUdhar)}
            sub="Active Udhar Balances"
            subColor="amber"
            icon={<Coins size={18} />}
          />
        </div>

        {/* Customer Ledger Table */}
        <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-5 overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[#8892a4]">
            Customer Database & Accounts
          </h3>

          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-[#8892a4]/70">
                <Users size={48} className="mb-2 text-[#8892a4]/20 animate-pulse" />
                <span className="text-sm font-medium">No customers registered yet</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#e8eaf0]">
                <thead>
                  <tr className="text-[#8892a4] border-b border-[#2a3248]/60 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Account</th>
                    <th className="py-3 px-4 font-semibold">Phone</th>
                    <th className="py-3 px-4 font-semibold">Segment</th>
                    <th className="py-3 px-4 font-semibold">Total Purchases</th>
                    <th className="py-3 px-4 font-semibold">Udhar Balance</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3248]/40">
                  {customers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="hover:bg-[#161b27]/40 transition-colors"
                    >
                      {/* Avatar initials + Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#6c63ff]/10 border border-[#6c63ff]/30 text-[#a78bfa] font-bold text-xs flex items-center justify-center select-none shadow-inner">
                            {getInitials(cust.name)}
                          </div>
                          <span className="font-bold text-white">{cust.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#8892a4] font-mono">
                        {cust.phone || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                            cust.type === "wholesale"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {cust.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {formatPKR(cust.total_purchase)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-lg border ${
                            cust.balance > 0
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }`}
                        >
                          {cust.balance > 0 ? formatPKR(cust.balance) : "Safar / Clear"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cust.balance > 0 && (
                            <button
                              onClick={() => handleOpenReceivePayment(cust)}
                              className="text-xs bg-[#22c55e]/10 text-green-400 hover:text-white hover:bg-[#22c55e] border border-[#22c55e]/30 px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Coins size={12} /> Receive Cash
                            </button>
                          )}
                          <button
                            onClick={() => handleViewCustomer(cust.id)}
                            className="text-blue-400 border border-blue-500/10 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Invoices Issued"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(cust.id)}
                            className="text-red-400 border border-red-500/10 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete Customer Account"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: Register Customer Form */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Customer Profile"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
              placeholder="E.g., Hafiz Bilal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
              placeholder="E.g., 0300-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Customer Type
              </label>
              <select
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Opening Balance Due (Udhar)
              </label>
              <input
                type="number"
                min="0"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                placeholder="Rs. 0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#2a3248]/50">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 border border-[#2a3248] text-[#e8eaf0] hover:bg-[#161b27] px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-[#6c63ff] hover:bg-[#7c75ff] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Register Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Receive Payment Form */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Receive Cash Deposit — ${selectedCust?.name || ""}`}
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div className="bg-[#161b27] border border-[#2a3248] p-3 rounded-xl space-y-1">
            <div className="flex justify-between text-xs text-[#8892a4]">
              <span>Customer Account:</span>
              <span className="font-bold text-white">{selectedCust?.name}</span>
            </div>
            <div className="flex justify-between text-xs text-[#8892a4]">
              <span>Outstanding Udhar:</span>
              <span className="font-bold text-amber-400">{formatPKR(selectedCust?.balance || 0)}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Payment Amount Received PKR *
            </label>
            <input
              type="number"
              required
              min="1"
              max={selectedCust?.balance}
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
              placeholder="Enter amount"
              value={payAmount}
              onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Payment Date
            </label>
            <input
              type="date"
              required
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#2a3248]/50">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="flex-1 border border-[#2a3248] text-[#e8eaf0] hover:bg-[#161b27] px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={payAmount <= 0}
              className="flex-1 bg-[#22c55e] hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Confirm Cash Received
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Customer Detailed History Viewer */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Account History — ${selectedCust?.name || ""}`}
      >
        {selectedCust && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-[#2a3248]/60 pb-3">
              <div>
                <span className="text-[#8892a4] block">Full Name:</span>
                <span className="font-bold text-white text-sm block">{selectedCust.name}</span>
                <span className="text-[#8892a4] block mt-2">Mobile Phone:</span>
                <span className="text-white block font-mono">{selectedCust.phone || "No number listed"}</span>
              </div>
              <div className="text-right">
                <span className="text-[#8892a4] block">Pricing Tier:</span>
                <span className="font-bold text-white uppercase">{selectedCust.type}</span>
                <span className="text-[#8892a4] block mt-2">Active Udhar:</span>
                <span className="text-amber-400 font-bold block text-sm">
                  {formatPKR(selectedCust.balance)}
                </span>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#8892a4] uppercase tracking-wider block">
                Billing Logs ({selectedCust.invoices?.length || 0})
              </span>
              <div className="bg-[#161b27] border border-[#2a3248] rounded-xl max-h-[160px] overflow-y-auto">
                {selectedCust.invoices?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#8892a4]">No billing history logged</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1c2233] text-[#8892a4] sticky top-0 border-b border-[#2a3248]/40">
                      <tr>
                        <th className="p-2 pl-3">Invoice #</th>
                        <th className="p-2">Date</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-right pr-3">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a3248]/30">
                      {selectedCust.invoices?.map((inv: any) => (
                        <tr key={inv.id}>
                          <td className="p-2 pl-3 font-mono font-bold text-white">{inv.invoice_no}</td>
                          <td className="p-2 text-[#8892a4]">{inv.date}</td>
                          <td className="p-2 text-right text-[#e8eaf0]">{formatPKR(inv.total)}</td>
                          <td className="p-2 text-right font-bold text-amber-400 pr-3">
                            {inv.balance > 0 ? formatPKR(inv.balance) : "Paid"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Payments List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#8892a4] uppercase tracking-wider block">
                Cash Received History ({selectedCust.payments?.length || 0})
              </span>
              <div className="bg-[#161b27] border border-[#2a3248] rounded-xl max-h-[160px] overflow-y-auto">
                {selectedCust.payments?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#8892a4]">No transaction logs found</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1c2233] text-[#8892a4] sticky top-0 border-b border-[#2a3248]/40">
                      <tr>
                        <th className="p-2 pl-3">Date</th>
                        <th className="p-2">Payment Category</th>
                        <th className="p-2 text-right pr-3">Amount Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a3248]/30">
                      {selectedCust.payments?.map((p: any) => (
                        <tr key={p.id}>
                          <td className="p-2 pl-3 text-[#8892a4]">{p.date}</td>
                          <td className="p-2 text-white">
                            {p.invoice_id ? `Invoice ID: ${p.invoice_id}` : "Direct Cash Payment"}
                          </td>
                          <td className="p-2 text-right font-bold text-green-400 pr-3">
                            {formatPKR(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsViewModalOpen(false)}
              className="w-full bg-[#1c2233] hover:bg-[#2a3248] border border-[#2a3248] text-[#e8eaf0] py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Ledger
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
