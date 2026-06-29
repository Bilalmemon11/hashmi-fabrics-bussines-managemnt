import React, { useState } from "react";
import { Topbar } from "../components/Topbar";
import { StatCard } from "../components/StatCard";
import { Modal } from "../components/Modal";
import { useApp } from "../context/AppContext";
import { formatPKR } from "../utils";
import { Plus, Wallet, Trash2, Tag, Calendar, FileText } from "lucide-react";

export const Expenses: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] = useState("Rent");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);

  // Group expenses by category
  const expensesGrouped: Record<string, number> = {};
  expenses.forEach((e) => {
    expensesGrouped[e.category] = (expensesGrouped[e.category] || 0) + e.amount;
  });

  // Sort categories by expenditure volume
  const sortedCategories = Object.keys(expensesGrouped)
    .map((cat) => ({ name: cat, amount: expensesGrouped[cat] }))
    .sort((a, b) => b.amount - a.amount);

  // Top 4 categories
  const top4 = sortedCategories.slice(0, 4);

  const grandTotalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAddModal = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setCategory("Rent");
    setDescription("");
    setAmount(0);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const success = await addExpense({
      date,
      category,
      description: description || null,
      amount,
    });

    if (success) {
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      await deleteExpense(id);
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "rent":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "salary":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "electricity":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "transport":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "packing":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-[#8892a4]/10 text-[#8892a4] border-[#8892a4]/20";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar
        title="Business Expenses"
        action={
          <button
            onClick={handleOpenAddModal}
            className="bg-[#6c63ff] hover:bg-[#7c75ff] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 cursor-pointer"
          >
            <Plus size={16} /> Add Expense
          </button>
        }
      />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Top 4 Expense Categories Stat Cards Row */}
        {top4.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {top4.map((c) => (
              <StatCard
                key={c.name}
                label={`${c.name} Outflow`}
                value={formatPKR(c.amount)}
                sub="Category totals"
                subColor={
                  c.name === "Rent"
                    ? "purple"
                    : c.name === "Salary"
                    ? "blue"
                    : c.name === "Electricity"
                    ? "amber"
                    : "default"
                }
                icon={<Wallet size={16} />}
              />
            ))}
            {top4.length < 4 && (
              // Filler cards if less than 4 categories exist
              Array.from({ length: 4 - top4.length }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-[#1c2233]/40 border border-[#2a3248]/50 rounded-xl p-5 flex items-center justify-center text-xs text-[#8892a4]"
                >
                  Unassigned Category Slot
                </div>
              ))
            )}
          </div>
        )}

        {/* Expenses Ledger Table */}
        <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-5 overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[#8892a4]">
            General Expenditure History Ledger
          </h3>

          <div className="overflow-x-auto">
            {expenses.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-[#8892a4]/70">
                <Wallet size={48} className="mb-2 text-[#8892a4]/20 animate-pulse" />
                <span className="text-sm font-medium">No expenses logged yet</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#e8eaf0]">
                <thead>
                  <tr className="text-[#8892a4] border-b border-[#2a3248]/60 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Memo / Description</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3248]/40">
                  {expenses.map((e) => (
                    <tr
                      key={e.id}
                      className="hover:bg-[#161b27]/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-[#8892a4]">{e.date}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(e.category)}`}>
                          {e.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#8892a4] truncate max-w-[250px]">
                        {e.description || "—"}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {formatPKR(e.amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-red-400 border border-red-500/10 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Delete expense record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Grand total footer */}
                  <tr className="bg-[#161b27]/60 font-bold border-t-2 border-[#2a3248]">
                    <td colSpan={3} className="py-3.5 px-4 text-right text-[#8892a4] uppercase text-[10px] tracking-wider">
                      Grand Total Expenditures:
                    </td>
                    <td className="py-3.5 px-4 text-white text-sm font-extrabold text-left">
                      {formatPKR(grandTotalExpenses)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: Add Expense */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Business Expense Outflow"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Expense Category *
              </label>
              <select
                required
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Rent">Rent</option>
                <option value="Salary">Salary</option>
                <option value="Electricity">Electricity</option>
                <option value="Transport">Transport</option>
                <option value="Packing">Packing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Expense Date
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

          {/* Amount input */}
          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Expense Amount PKR *
            </label>
            <input
              type="number"
              required
              min="1"
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
              placeholder="E.g., 6500"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Memo Notes / Description
            </label>
            <textarea
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#6c63ff] w-full h-20 resize-none"
              placeholder="E.g., Staff salary for June or electricity shop bill details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              disabled={amount <= 0}
              className="flex-1 bg-[#6c63ff] hover:bg-[#7c75ff] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Confirm Outflow
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
