import React, { useState } from "react";
import { Topbar } from "../components/Topbar";
import { Modal } from "../components/Modal";
import { useApp } from "../context/AppContext";
import { formatPKR } from "../utils";
import { Plus, ShoppingCart, Trash2, Calendar, FileText } from "lucide-react";

export const Purchases: React.FC = () => {
  const { purchases, vendors, addPurchase, deletePurchase } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [vendorId, setVendorId] = useState<number>(0);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [itemsDesc, setItemsDesc] = useState("");
  const [total, setTotal] = useState<number>(0);
  const [paid, setPaid] = useState<number>(0);

  const balance = Math.max(0, total - paid);

  const handleOpenAddModal = () => {
    setVendorId(0);
    setDate(new Date().toISOString().split("T")[0]);
    setItemsDesc("");
    setTotal(0);
    setPaid(0);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || total <= 0) return;

    const success = await addPurchase({
      vendor_id: Number(vendorId),
      date,
      items_description: itemsDesc || null,
      total,
      paid,
      balance,
    });

    if (success) {
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this purchase order? Vendor balance will be adjusted.")) {
      await deletePurchase(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar
        title="Procurement Purchases"
        action={
          <button
            onClick={handleOpenAddModal}
            className="bg-[#6c63ff] hover:bg-[#7c75ff] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 cursor-pointer"
          >
            <Plus size={16} /> New Purchase Order
          </button>
        }
      />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Purchases Ledger Table */}
        <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-5 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#8892a4]">
              Inventory Procurement Ledger (POs)
            </h3>
            <span className="text-xs text-[#8892a4]">
              Total Active POs: <span className="font-bold text-white">{purchases.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            {purchases.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-[#8892a4]/70">
                <ShoppingCart size={48} className="mb-2 text-[#8892a4]/20 animate-pulse" />
                <span className="text-sm font-medium">No purchase records registered yet</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#e8eaf0]">
                <thead>
                  <tr className="text-[#8892a4] border-b border-[#2a3248]/60 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">PO Number</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Vendor Mill</th>
                    <th className="py-3 px-4 font-semibold">Items Description</th>
                    <th className="py-3 px-4 font-semibold">Total PKR</th>
                    <th className="py-3 px-4 font-semibold">Paid PKR</th>
                    <th className="py-3 px-4 font-semibold">Balance Due</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3248]/40">
                  {purchases.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#161b27]/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        {p.po_no}
                      </td>
                      <td className="py-3 px-4 text-[#8892a4]">{p.date}</td>
                      <td className="py-3 px-4 font-semibold">
                        {p.vendor_name}
                      </td>
                      <td className="py-3 px-4 text-[#8892a4] truncate max-w-[200px]">
                        {p.items_description || "—"}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {formatPKR(p.total)}
                      </td>
                      <td className="py-3 px-4 text-green-400">
                        {formatPKR(p.paid)}
                      </td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          p.balance > 0 ? "text-red-400" : "text-[#8892a4]"
                        }`}
                      >
                        {p.balance > 0 ? formatPKR(p.balance) : "Cleared"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-400 border border-red-500/10 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Delete PO"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: New Purchase Order Form */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Issue New Procurement Purchase Order (PO)"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Vendor Selection */}
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Select Vendor Mill *
              </label>
              <select
                required
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={vendorId}
                onChange={(e) => setVendorId(Number(e.target.value))}
              >
                <option value="0">Choose vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.city} • Balance: {formatPKR(v.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Order Date
              </label>
              <input
                type="date"
                required
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description of items */}
          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Procured items description details
            </label>
            <textarea
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#6c63ff] w-full h-20 resize-none"
              placeholder="E.g., 50 rolls of Cotton Shirting, 25 rolls of Silk fabric"
              value={itemsDesc}
              onChange={(e) => setItemsDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            {/* Cash Paid upfront */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                  Upfront Paid Amount PKR
                </label>
                <input
                  type="number"
                  min="0"
                  max={total}
                  className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                  placeholder="Upfront cash payment"
                  value={paid}
                  onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Calculations Summary Card */}
            <div className="bg-[#161b27] border border-[#2a3248] p-4 rounded-xl flex flex-col gap-2 justify-center">
              <div className="flex justify-between text-xs text-[#8892a4] items-center">
                <span>Gross PO Amount:</span>
                <input
                  type="number"
                  min="0"
                  required
                  className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded px-1.5 py-0.5 text-right text-xs w-24 font-bold focus:outline-none focus:border-[#6c63ff]"
                  value={total}
                  onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex justify-between text-xs text-[#8892a4]">
                <span>Cash Settled:</span>
                <span className="font-medium text-[#22c55e]">{formatPKR(paid)}</span>
              </div>
              <hr className="border-[#2a3248]/55" />
              <div className="flex justify-between text-xs font-bold text-white uppercase">
                <span>Payable to Vendor:</span>
                <span className="text-red-400">{formatPKR(balance)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={total <= 0 || !vendorId}
              className="flex-1 bg-[#6c63ff] hover:bg-[#7c75ff] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Log Procurement PO
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
