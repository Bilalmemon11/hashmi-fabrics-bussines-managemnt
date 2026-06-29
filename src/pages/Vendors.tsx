import React, { useState } from "react";
import { Topbar } from "../components/Topbar";
import { StatCard } from "../components/StatCard";
import { Modal } from "../components/Modal";
import { useApp } from "../context/AppContext";
import { formatPKR, getInitials } from "../utils";
import {
  Briefcase,
  TrendingDown,
  TrendingUp,
  Coins,
  Plus,
  CoinsIcon,
  ShieldCheck,
  Eye,
  Trash2,
  FileDown,
} from "lucide-react";
import api from "../services/api";

export const Vendors: React.FC = () => {
  const {
    vendors,
    addVendor,
    payVendor,
    deleteVendor,
    alert,
    triggerPrint,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Active vendor for sub-operations
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payNotes, setPayNotes] = useState("");
  const [payDate, setPayDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Calculations for Stats
  const vendorCount = vendors.length;
  const totalVendorPurchases = vendors.reduce((sum, v) => sum + v.total_purchase, 0);
  const totalVendorPayables = vendors.reduce((sum, v) => sum + v.balance, 0);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const success = await addVendor({
      name,
      phone: phone || null,
      city: city || null,
      balance: initialBalance,
      total_purchase: 0,
    } as any);

    if (success) {
      setName("");
      setPhone("");
      setCity("");
      setInitialBalance(0);
      setIsAddModalOpen(false);
    }
  };

  const handleOpenPayModal = (vend: any) => {
    setSelectedVendor(vend);
    setPayAmount(vend.balance);
    setPayNotes("");
    setPayDate(new Date().toISOString().split("T")[0]);
    setIsPayModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || payAmount <= 0) return;

    const success = await payVendor(selectedVendor.id, payAmount, payNotes, payDate);
    if (success) {
      setIsPayModalOpen(false);

      // Fetch updated supplier ledger details (including today's new payment) from database
      try {
        const res = await api.get(`/vendors/${selectedVendor.id}`);
        if (res.data && res.data.success) {
          const updatedVendor = res.data.data;
          triggerPrint({
            type: "vendor-receipt",
            vendor: updatedVendor,
            payments: updatedVendor.payments,
            currentPayment: {
              amount: payAmount,
              date: payDate,
              notes: payNotes,
            }
          });
        }
      } catch (err) {
        console.error("Error printing supplier voucher:", err);
      }

      setSelectedVendor(null);
    }
  };

  const handleViewVendor = async (id: number) => {
    try {
      const res = await api.get(`/vendors/${id}`);
      if (res.data && res.data.success) {
        setSelectedVendor(res.data.data);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching vendor transactions:", error);
    }
  };

  const handleDeleteVendor = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this vendor account?")) {
      await deleteVendor(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar
        title="Suppliers & Vendors"
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#6c63ff] hover:bg-[#7c75ff] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 cursor-pointer"
          >
            <Plus size={16} /> Add Vendor
          </button>
        }
      />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Stat Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Wholesale Suppliers"
            value={vendorCount}
            sub="Registered fabric mills"
            subColor="purple"
            icon={<Briefcase size={18} />}
          />
          <StatCard
            label="Gross Supplier Purchases"
            value={formatPKR(totalVendorPurchases)}
            sub="Inventory procurement value"
            subColor="green"
            icon={<TrendingUp size={18} />}
          />
          <StatCard
            label="Total Accounts Payable"
            value={formatPKR(totalVendorPayables)}
            sub="Liabilities to settled"
            subColor="red"
            icon={<Coins size={18} />}
          />
        </div>

        {/* Vendors List Table */}
        <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-5 overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[#8892a4]">
            Vendor Mill Directory & Balances
          </h3>

          <div className="overflow-x-auto">
            {vendors.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-[#8892a4]/70">
                <Briefcase size={48} className="mb-2 text-[#8892a4]/20 animate-pulse" />
                <span className="text-sm font-medium">No vendors registered yet</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#e8eaf0]">
                <thead>
                  <tr className="text-[#8892a4] border-b border-[#2a3248]/60 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Vendor Mill</th>
                    <th className="py-3 px-4 font-semibold">City</th>
                    <th className="py-3 px-4 font-semibold">Phone</th>
                    <th className="py-3 px-4 font-semibold">Procurement Vol</th>
                    <th className="py-3 px-4 font-semibold">Payable Balance</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3248]/40">
                  {vendors.map((vend) => (
                    <tr
                      key={vend.id}
                      className="hover:bg-[#161b27]/40 transition-colors"
                    >
                      {/* Avatar initials + Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] font-bold text-xs flex items-center justify-center select-none shadow-inner">
                            {getInitials(vend.name)}
                          </div>
                          <span className="font-bold text-white">{vend.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#8892a4]">
                        {vend.city || "—"}
                      </td>
                      <td className="py-3 px-4 text-[#8892a4] font-mono">
                        {vend.phone || "—"}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {formatPKR(vend.total_purchase)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-lg border ${
                            vend.balance > 0
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }`}
                        >
                          {vend.balance > 0 ? formatPKR(vend.balance) : "Settle / Clear"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {vend.balance > 0 && (
                            <button
                              onClick={() => handleOpenPayModal(vend)}
                              className="text-xs bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 border border-red-500/30 px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <CoinsIcon size={12} /> Pay Supplier
                            </button>
                          )}
                          <button
                            onClick={() => handleViewVendor(vend.id)}
                            className="text-blue-400 border border-blue-500/10 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Vendor Purchase logs"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vend.id)}
                            className="text-red-400 border border-red-500/10 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete Vendor Account"
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

      {/* MODAL: Register Vendor */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Fabric Supplier"
      >
        <form onSubmit={handleAddVendor} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Vendor Mill Name *
            </label>
            <input
              type="text"
              required
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
              placeholder="E.g., Chenab Fabrics"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                City / Location
              </label>
              <input
                type="text"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                placeholder="E.g., Faisalabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                placeholder="E.g., 041-7788990"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Opening Payable Balance
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
              Register Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Pay Vendor */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Process Supplier Payment — ${selectedVendor?.name || ""}`}
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div className="bg-[#161b27] border border-[#2a3248] p-3 rounded-xl space-y-1">
            <div className="flex justify-between text-xs text-[#8892a4]">
              <span>Vendor / Mill:</span>
              <span className="font-bold text-white">{selectedVendor?.name}</span>
            </div>
            <div className="flex justify-between text-xs text-[#8892a4]">
              <span>Outstanding Payable:</span>
              <span className="font-bold text-red-400">{formatPKR(selectedVendor?.balance || 0)}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Payment Amount PKR *
            </label>
            <input
              type="number"
              required
              min="1"
              max={selectedVendor?.balance}
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

          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Notes / Memo
            </label>
            <textarea
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#6c63ff] w-full h-16 resize-none"
              placeholder="E.g., Cheque no. 234890 or Bank transfer"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
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
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Confirm Cash Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Vendor Detailed History Viewer */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Supplier Statement — ${selectedVendor?.name || ""}`}
      >
        {selectedVendor && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-[#2a3248]/60 pb-3">
              <div>
                <span className="text-[#8892a4] block">Mill Name:</span>
                <span className="font-bold text-white text-sm block">{selectedVendor.name}</span>
                <span className="text-[#8892a4] block mt-2">Location:</span>
                <span className="text-white block font-bold">{selectedVendor.city || "Not Specified"}</span>
              </div>
              <div className="text-right">
                <span className="text-[#8892a4] block">Phone / Tel:</span>
                <span className="font-mono text-white block">{selectedVendor.phone || "No contact info"}</span>
                <span className="text-[#8892a4] block mt-2">Dues Payable:</span>
                <span className="text-red-400 font-bold block text-sm">
                  {formatPKR(selectedVendor.balance)}
                </span>
              </div>
            </div>

            {/* Procurement Purchases */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#8892a4] uppercase tracking-wider block">
                Procurements List ({selectedVendor.purchases?.length || 0})
              </span>
              <div className="bg-[#161b27] border border-[#2a3248] rounded-xl max-h-[160px] overflow-y-auto">
                {selectedVendor.purchases?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#8892a4]">No purchase logs issued</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1c2233] text-[#8892a4] sticky top-0 border-b border-[#2a3248]/40">
                      <tr>
                        <th className="p-2 pl-3">PO #</th>
                        <th className="p-2">Date</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-right pr-3">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a3248]/30">
                      {selectedVendor.purchases?.map((pur: any) => (
                        <tr key={pur.id}>
                          <td className="p-2 pl-3 font-mono font-bold text-white">{pur.po_no}</td>
                          <td className="p-2 text-[#8892a4]">{pur.date}</td>
                          <td className="p-2 text-right text-[#e8eaf0]">{formatPKR(pur.total)}</td>
                          <td className="p-2 text-right font-bold text-red-400 pr-3">
                            {pur.balance > 0 ? formatPKR(pur.balance) : "Paid"}
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
                Cash Settled History ({selectedVendor.payments?.length || 0})
              </span>
              <div className="bg-[#161b27] border border-[#2a3248] rounded-xl max-h-[160px] overflow-y-auto">
                {selectedVendor.payments?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#8892a4]">No transaction logs found</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1c2233] text-[#8892a4] sticky top-0 border-b border-[#2a3248]/40">
                      <tr>
                        <th className="p-2 pl-3">Date</th>
                        <th className="p-2">Memo Notes</th>
                        <th className="p-2 text-right pr-3">Amount Settled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a3248]/30">
                      {selectedVendor.payments?.map((p: any) => (
                        <tr key={p.id}>
                          <td className="p-2 pl-3 text-[#8892a4]">{p.date}</td>
                          <td className="p-2 text-white text-[11px]">
                            {p.notes || "Standard settlement payment"}
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  triggerPrint({
                    type: "vendor-receipt",
                    vendor: selectedVendor,
                    payments: selectedVendor.payments,
                  })
                }
                className="flex-grow bg-[#6c63ff] hover:bg-[#7c75ff] text-white py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileDown size={14} /> Print Statement
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-grow bg-[#1c2233] hover:bg-[#2a3248] border border-[#2a3248] text-[#e8eaf0] py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
