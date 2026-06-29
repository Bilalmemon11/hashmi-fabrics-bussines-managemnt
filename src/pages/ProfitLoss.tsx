import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Topbar } from "../components/Topbar";
import { StatCard } from "../components/StatCard";
import { ProfitLossData } from "../types";
import { formatPKR } from "../utils";
import { useApp } from "../context/AppContext";
import {
  TrendingUp,
  Percent,
  Wallet,
  Scale,
  Award,
  DollarSign,
  Briefcase,
  Layers,
} from "lucide-react";

export const ProfitLoss: React.FC = () => {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [fetching, setFetching] = useState(true);
  const { invoices, expenses } = useApp(); // Reload if dependencies update

  const loadFinancialData = async () => {
    setFetching(true);
    try {
      const res = await api.get("/reports/profit-loss");
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error loading Profit & Loss report:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, [invoices, expenses]);

  if (fetching || !data) {
    return (
      <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0]">
        <Topbar title="Profit & Loss Statement" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-[#8892a4]">Generating Income Statement...</span>
          </div>
        </div>
      </div>
    );
  }

  const isNetProfit = data.net_profit >= 0;

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar title="Profit & Loss Statements" />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Row 1: 4 Financial Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatPKR(data.total_revenue)}
            sub="Gross invoicing sales"
            subColor="purple"
            icon={<TrendingUp size={18} />}
          />
          <StatCard
            label="Gross Profit"
            value={formatPKR(data.gross_profit)}
            sub="Sales minus fabric COGS"
            subColor="green"
            icon={<Award size={18} />}
          />
          <StatCard
            label="Operating Expenses"
            value={formatPKR(data.total_expenses)}
            sub="Combined business overheads"
            subColor="amber"
            icon={<Wallet size={18} />}
          />
          <StatCard
            label="Net Profit"
            value={formatPKR(data.net_profit)}
            sub="Final bottom line net"
            subColor={isNetProfit ? "green" : "red"}
            icon={<Scale size={18} />}
          />
        </div>

        {/* Row 2: Income Statement (Left) vs Margin Ratio & Averages (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Statement Panel */}
          <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider text-[#8892a4] flex items-center gap-2">
                <DollarSign size={16} className="text-[#6c63ff]" /> Formal Income Statement
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                {/* 1. Revenue section */}
                <div className="border-b border-[#2a3248]/40 pb-2.5">
                  <div className="flex justify-between items-center text-white mb-1">
                    <span>1. Sales Revenue</span>
                    <span className="font-bold text-sm">{formatPKR(data.total_revenue)}</span>
                  </div>
                  <span className="text-[10px] text-[#8892a4] font-medium uppercase tracking-wider">
                    Total sales invoices volume
                  </span>
                </div>

                {/* 2. COGS Section */}
                <div className="border-b border-[#2a3248]/40 pb-2.5">
                  <div className="flex justify-between items-center text-[#8892a4] mb-1">
                    <span>2. Less: Cost of Goods Sold (COGS)</span>
                    <span className="font-bold text-red-400">({formatPKR(data.total_cogs)})</span>
                  </div>
                  <span className="text-[10px] text-[#8892a4] font-medium uppercase tracking-wider">
                    Fabric material costs at procurement valuation
                  </span>
                </div>

                {/* 3. Gross profit */}
                <div className="border-b border-[#2a3248]/40 pb-2.5 bg-[#161b27]/30 p-2.5 rounded-lg border border-[#2a3248]/20">
                  <div className="flex justify-between items-center text-white">
                    <span className="uppercase text-[11px] tracking-wider font-bold">Gross Profit:</span>
                    <span className="font-extrabold text-sm text-green-400">
                      {formatPKR(data.gross_profit)}
                    </span>
                  </div>
                </div>

                {/* 4. Expenses Section */}
                <div className="border-b border-[#2a3248]/40 pb-2.5">
                  <div className="flex justify-between items-center text-[#8892a4] mb-2">
                    <span>3. Less: Operating Expenses</span>
                    <span className="font-bold text-red-400">({formatPKR(data.total_expenses)})</span>
                  </div>

                  {/* Expense Breakdown List */}
                  <div className="space-y-1.5 pl-4">
                    {data.expense_breakdown.map((exp) => (
                      <div key={exp.category} className="flex justify-between text-[#8892a4] font-medium text-[11px]">
                        <span>• {exp.category} expenses</span>
                        <span>{formatPKR(exp.amount)}</span>
                      </div>
                    ))}
                    {data.expense_breakdown.length === 0 && (
                      <span className="text-[10px] text-[#8892a4]/50">No expenses logged in database</span>
                    )}
                  </div>
                </div>

                {/* 5. Net profit margin output box */}
                <div
                  className={`p-4 rounded-xl border flex justify-between items-center ${
                    isNetProfit
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                >
                  <span className="uppercase tracking-wider font-bold text-xs">
                    {isNetProfit ? "Net Profit Bottomline:" : "Net Loss Bottomline:"}
                  </span>
                  <span className="font-black text-lg">
                    {formatPKR(data.net_profit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ratio & Weekly Average Panel */}
          <div className="space-y-6">
            {/* Margin ratios card */}
            <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider text-[#8892a4] flex items-center gap-2">
                <Percent size={16} className="text-[#a78bfa]" /> Margin & Ratio Analysis
              </h3>

              <div className="space-y-5">
                {/* Gross Margin % */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#8892a4]">Gross Profit Margin %</span>
                    <span className="font-bold text-green-400">{data.gross_margin_pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#0f1117] h-2 rounded-full overflow-hidden border border-[#2a3248]/30">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${data.gross_margin_pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Net Margin % */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#8892a4]">Net Profit Margin %</span>
                    <span className={`font-bold ${isNetProfit ? "text-green-400" : "text-red-400"}`}>
                      {data.net_margin_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#0f1117] h-2 rounded-full overflow-hidden border border-[#2a3248]/30">
                    <div
                      className={`${isNetProfit ? "bg-[#6c63ff]" : "bg-red-500"} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(0, data.net_margin_pct)}%` }}
                    ></div>
                  </div>
                </div>

                {/* COGS Ratio % */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#8892a4]">COGS Ratio % (Material Intensity)</span>
                    <span className="font-bold text-amber-500">{data.cogs_ratio_pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#0f1117] h-2 rounded-full overflow-hidden border border-[#2a3248]/30">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${data.cogs_ratio_pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expense Ratio % */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#8892a4]">Operating Expense Ratio %</span>
                    <span className="font-bold text-red-400">{data.expense_ratio_pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#0f1117] h-2 rounded-full overflow-hidden border border-[#2a3248]/30">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${data.expense_ratio_pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Averages summary card */}
            <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[#8892a4] flex items-center gap-2">
                <Layers size={16} className="text-blue-400" /> Weekly Running Averages
              </h3>
              <p className="text-xs text-[#8892a4] mb-4">Calculated by dividing overall financial statement indicators by 4</p>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 bg-[#161b27]/80 border border-[#2a3248] rounded-xl">
                  <span className="text-[#8892a4] text-[10px] uppercase tracking-wider block mb-1">Weekly Sales:</span>
                  <span className="text-white text-sm font-bold">{formatPKR(data.weekly_avg.revenue)}</span>
                </div>
                <div className="p-3 bg-[#161b27]/80 border border-[#2a3248] rounded-xl">
                  <span className="text-[#8892a4] text-[10px] uppercase tracking-wider block mb-1">Weekly COGS:</span>
                  <span className="text-red-400 text-sm font-bold">{formatPKR(data.weekly_avg.cogs)}</span>
                </div>
                <div className="p-3 bg-[#161b27]/80 border border-[#2a3248] rounded-xl">
                  <span className="text-[#8892a4] text-[10px] uppercase tracking-wider block mb-1">Weekly Expenses:</span>
                  <span className="text-amber-500 text-sm font-bold">{formatPKR(data.weekly_avg.expenses)}</span>
                </div>
                <div className="p-3 bg-[#161b27]/80 border border-[#2a3248] rounded-xl">
                  <span className="text-[#8892a4] text-[10px] uppercase tracking-wider block mb-1">Weekly Net Profit:</span>
                  <span className={`${isNetProfit ? "text-green-400" : "text-red-400"} text-sm font-bold`}>
                    {formatPKR(data.weekly_avg.net_profit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
