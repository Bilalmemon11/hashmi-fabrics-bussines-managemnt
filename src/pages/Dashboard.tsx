import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Topbar } from "../components/Topbar";
import { StatCard } from "../components/StatCard";
import { DashboardData } from "../types";
import { formatPKR } from "../utils";
import { useApp } from "../context/AppContext";
import {
  TrendingUp,
  Coins,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Users,
  Briefcase,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);
  const { loading: resourcesLoading, alert } = useApp();

  const fetchDashboardData = async () => {
    setFetching(true);
    try {
      const res = await api.get("/dashboard");
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [resourcesLoading.global]); // Refetch if resources are updated globally

  if (fetching || !data) {
    return (
      <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0]">
        <Topbar title="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-[#8892a4]">
              Loading Hashmi Fabrics Business Metrics...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate highest expense to use as scale for progress bars
  const maxExpense = Math.max(...data.expense_by_category.map((e) => e.amount), 1);

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar
        title="Dashboard"
        action={
          <button
            onClick={fetchDashboardData}
            className="border border-[#2a3248] text-[#e8eaf0] hover:bg-[#1c2233] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            Refresh Metrics
          </button>
        }
      />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Alerts / Toast */}
        {alert && (
          <div
            className={`px-4 py-3 rounded-lg border text-sm flex items-center gap-2 ${
              alert.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <AlertCircle size={16} />
            <span>{alert.text}</span>
          </div>
        )}

        {/* First Row: 4 Stat Cards */}
        {/* Bento Grid layout wrapper */}
        <div className="grid grid-cols-12 gap-5">
          {/* Row 1: Stat Cards */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <StatCard
              label="Total Sales"
              value={formatPKR(data.total_sales)}
              sub="Gross Turnover"
              subColor="purple"
              icon={<TrendingUp size={18} />}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <StatCard
              label="Cash Received"
              value={formatPKR(data.cash_collected)}
              sub="Cash Flow Liquid"
              subColor="green"
              icon={<Coins size={18} />}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <StatCard
              label="Customer Udhar"
              value={formatPKR(data.customer_udhar)}
              sub="Receivables Outstanding"
              subColor="amber"
              icon={<ArrowUpRight size={18} />}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <StatCard
              label="Vendor Payable"
              value={formatPKR(data.vendor_payable)}
              sub="Outstanding Dues"
              subColor="red"
              icon={<ShieldAlert size={18} />}
            />
          </div>

          {/* Row 2: Today's Invoices (col-span-8) & Low Stock Alerts (col-span-4) */}
          <div className="col-span-12 lg:col-span-8 bg-[#1c2233] border border-[#2a3248] rounded-xl flex flex-col h-[360px] overflow-hidden shadow-sm hover:border-[#6c63ff]/20 transition-all duration-200">
            <div className="p-4 border-b border-[#2a3248] flex justify-between items-center bg-[#161b27]/30">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-[#8892a4]">
                <Calendar size={15} className="text-[#a78bfa]" /> Today's Invoices
              </h3>
              <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full">
                {data.todays_invoices.length} New
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#2a3248] scrollbar-track-transparent">
              {data.todays_invoices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6 text-[#8892a4]/70">
                  <FileSpreadsheet size={36} className="mb-2 text-[#8892a4]/40" />
                  <span className="text-xs">No invoices created today</span>
                </div>
              ) : (
                data.todays_invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 bg-[#161b27] border border-[#2a3248] rounded-lg flex items-center justify-between hover:border-[#6c63ff]/30 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-[#e8eaf0]">
                        {inv.customer_name}
                      </span>
                      <span className="text-[10px] font-mono text-[#8892a4]">
                        {inv.invoice_no} • {inv.payment_type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-white">
                        {formatPKR(inv.total)}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                          inv.balance > 0
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-green-500/15 text-green-400"
                        }`}
                      >
                        {inv.balance > 0 ? "Udhar Pending" : "Paid"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-[#1c2233] border border-[#2a3248] rounded-xl flex flex-col h-[360px] overflow-hidden shadow-sm hover:border-[#6c63ff]/20 transition-all duration-200">
            <div className="p-4 border-b border-[#2a3248] flex justify-between items-center bg-[#161b27]/30">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-[#8892a4]">
                <ShieldAlert size={15} className="text-red-400" /> Low Stock Alerts
              </h3>
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                {data.low_stock_products.length} Warnings
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#2a3248] scrollbar-track-transparent">
              {data.low_stock_products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6 text-green-400/80">
                  <ShieldAlert size={36} className="mb-2 text-green-500/40" />
                  <span className="text-xs">All fabric products are well-stocked!</span>
                </div>
              ) : (
                data.low_stock_products.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-[#161b27]/80 border border-red-500/10 rounded-lg flex items-center justify-between hover:border-red-500/20 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-[#e8eaf0]">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#8892a4]">
                        Cat: {p.category} • Reorder point: {p.reorder_level} {p.unit}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs font-bold text-red-400">
                        {p.stock_qty} {p.unit}
                      </span>
                      <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.2 rounded-full border border-red-500/10">
                        LOW
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Row 3: Expense Categories (col-span-4), Customer Udhar (col-span-4), Vendor Payables (col-span-4) */}
          <div className="col-span-12 lg:col-span-4 bg-[#1c2233] border border-[#2a3248] rounded-xl flex flex-col h-[360px] overflow-hidden shadow-sm hover:border-[#6c63ff]/20 transition-all duration-200">
            <div className="p-4 border-b border-[#2a3248] flex justify-between items-center bg-[#161b27]/30">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-[#8892a4]">
                <Coins size={15} className="text-amber-500" /> Expense Categories
              </h3>
              <span className="text-xs font-semibold text-white">
                {formatPKR(data.total_expenses)} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#2a3248] scrollbar-track-transparent">
              {data.expense_by_category.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6 text-[#8892a4]/70">
                  <Coins size={36} className="mb-2 text-[#8892a4]/40" />
                  <span className="text-xs">No expenses logged yet</span>
                </div>
              ) : (
                data.expense_by_category.map((exp) => {
                  const pct = Math.min((exp.amount / maxExpense) * 100, 100);
                  return (
                    <div key={exp.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#e8eaf0]">
                          {exp.category}
                        </span>
                        <span className="font-bold text-white">
                          {formatPKR(exp.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-[#161b27] h-2 rounded-full overflow-hidden border border-[#2a3248]/30">
                        <div
                          className="bg-[#6c63ff] h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-[#1c2233] border border-[#2a3248] rounded-xl flex flex-col h-[360px] overflow-hidden shadow-sm hover:border-[#6c63ff]/20 transition-all duration-200">
            <div className="p-4 border-b border-[#2a3248] flex justify-between items-center bg-[#161b27]/30">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-[#8892a4]">
                <Users size={15} className="text-[#a78bfa]" /> Customer Udhar
              </h3>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full">
                Active Dues
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pr-2 scrollbar-thin scrollbar-thumb-[#2a3248] scrollbar-track-transparent">
              {data.customer_dues.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6 text-[#8892a4]/70">
                  <Users size={32} className="mb-2 text-[#8892a4]/30" />
                  <span className="text-xs">All customers are fully cleared!</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#8892a4] border-b border-[#2a3248]/60 pb-2">
                      <th className="pb-2 font-semibold">Customer</th>
                      <th className="pb-2 font-semibold">Type</th>
                      <th className="pb-2 font-semibold text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.customer_dues.map((cust) => (
                      <tr
                        key={cust.id}
                        className="border-b border-[#2a3248]/30 hover:bg-[#161b27]/30 transition-colors"
                      >
                        <td className="py-2.5 font-medium text-white">
                          {cust.name}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                              cust.type === "wholesale"
                                ? "bg-purple-500/15 text-purple-400 border border-purple-500/10"
                                : "bg-blue-500/15 text-blue-400 border border-blue-500/10"
                            }`}
                          >
                            {cust.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-amber-400">
                          {formatPKR(cust.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-[#1c2233] border border-[#2a3248] rounded-xl flex flex-col h-[360px] overflow-hidden shadow-sm hover:border-[#6c63ff]/20 transition-all duration-200">
            <div className="p-4 border-b border-[#2a3248] flex justify-between items-center bg-[#161b27]/30">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-[#8892a4]">
                <Briefcase size={15} className="text-red-400" /> Vendor Payables
              </h3>
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                Settlements Due
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pr-2 scrollbar-thin scrollbar-thumb-[#2a3248] scrollbar-track-transparent">
              {data.vendor_dues.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#8892a4]/70 text-center py-6">
                  <ShieldAlert size={32} className="mb-2 text-green-500/30" />
                  <span className="text-xs">All vendor balances settled!</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#8892a4] border-b border-[#2a3248]/60 pb-2">
                      <th className="pb-2 font-semibold">Vendor</th>
                      <th className="pb-2 font-semibold">Location</th>
                      <th className="pb-2 font-semibold text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vendor_dues.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-[#2a3248]/30 hover:bg-[#161b27]/30 transition-colors"
                      >
                        <td className="py-2.5 font-medium text-white">{v.name}</td>
                        <td className="py-2.5 text-[#8892a4]">{v.city || "—"}</td>
                        <td className="py-2.5 text-right font-bold text-red-400">
                          {formatPKR(v.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
