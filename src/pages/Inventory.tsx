import React from "react";
import { Topbar } from "../components/Topbar";
import { StatCard } from "../components/StatCard";
import { useApp } from "../context/AppContext";
import { formatPKR } from "../utils";
import { Boxes, Landmark, Coins, AlertTriangle, ShieldCheck } from "lucide-react";

export const Inventory: React.FC = () => {
  const { products } = useApp();

  // Core calculations
  const totalProducts = products.length;
  const totalStockValAtCost = products.reduce((sum, p) => sum + (p.stock_qty * p.cost_price), 0);
  const totalStockValAtRetail = products.reduce((sum, p) => sum + (p.stock_qty * p.price), 0);

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar title="Warehouse & Inventory" />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Stat Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Fabric Articles Count"
            value={totalProducts}
            sub="Unique catalog entries"
            subColor="purple"
            icon={<Boxes size={18} />}
          />
          <StatCard
            label="Stock Value (At Cost)"
            value={formatPKR(totalStockValAtCost)}
            sub="Asset cost capital"
            subColor="amber"
            icon={<Coins size={18} />}
          />
          <StatCard
            label="Stock Value (At Retail)"
            value={formatPKR(totalStockValAtRetail)}
            sub="Potential retail value"
            subColor="green"
            icon={<Landmark size={18} />}
          />
        </div>

        {/* Inventory Stock Bars Grid */}
        <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#8892a4]">
                Stock Availability Progress
              </h3>
              <span className="text-xs text-[#8892a4]">
                Interactive status bars comparing current stock with trigger levels
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-green-400">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/10 border border-green-500/30 inline-block"></span> High Stock
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block"></span> Moderate
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/10 border border-red-500/30 inline-block"></span> Low Stock
              </span>
            </div>
          </div>

          {/* Catalog Grid */}
          {products.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#8892a4]/70">
              <Boxes size={48} className="mb-2 text-[#8892a4]/20 animate-pulse" />
              <span className="text-sm font-medium">No stock assets configured yet</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const reorder = p.reorder_level;
                const qty = p.stock_qty;

                // Color coding rules:
                // Green: qty > reorder * 2
                // Amber: qty > reorder and qty <= reorder * 2
                // Red: qty <= reorder
                let barColor = "bg-green-500";
                let textColor = "text-green-400";
                let bgColor = "bg-green-500/10";
                let borderColor = "border-green-500/20";
                let statusIcon = <ShieldCheck size={12} />;
                let statusLabel = "Securely Stocked";

                if (qty <= reorder) {
                  barColor = "bg-red-500";
                  textColor = "text-red-400";
                  bgColor = "bg-red-500/10";
                  borderColor = "border-red-500/20";
                  statusIcon = <AlertTriangle size={12} />;
                  statusLabel = "Reorder Warning";
                } else if (qty <= reorder * 2) {
                  barColor = "bg-amber-500";
                  textColor = "text-amber-400";
                  bgColor = "bg-amber-500/10";
                  borderColor = "border-amber-500/20";
                  statusIcon = <AlertTriangle size={12} />;
                  statusLabel = "Moderate Stock";
                }

                // Compute maximum scale for progress bar (say, 100 units or double reorder level)
                const scaleMax = Math.max(reorder * 4, qty, 50);
                const pct = Math.min((qty / scaleMax) * 100, 100);

                // Calculations per product
                const costVal = qty * p.cost_price;
                const priceVal = qty * p.price;

                return (
                  <div
                    key={p.id}
                    className="p-4 bg-[#161b27]/80 border border-[#2a3248] rounded-xl hover:border-[#6c63ff]/25 transition-colors group flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Header */}
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-white tracking-tight group-hover:text-[#a78bfa] transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#8892a4] uppercase font-semibold">
                          {p.category}
                        </span>
                      </div>

                      {/* Stock Badge and Units */}
                      <div className="flex justify-between items-center mb-4 text-xs font-semibold">
                        <span className="text-[#8892a4]">
                          Warehouse Stock: <span className="text-white font-bold">{qty} {p.unit}</span>
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${textColor} ${bgColor} ${borderColor}`}>
                          {statusIcon} {statusLabel}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="w-full bg-[#0f1117] h-2 rounded-full overflow-hidden border border-[#2a3248]/30">
                          <div
                            className={`${barColor} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-[#8892a4] font-medium font-mono">
                          <span>0 {p.unit}</span>
                          <span>Reorder Alert Point: {reorder} {p.unit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Asset value */}
                    <div className="border-t border-[#2a3248]/50 pt-3 flex justify-between items-center text-[11px] font-semibold text-[#8892a4]">
                      <div className="flex flex-col gap-0.5">
                        <span>Cost Asset:</span>
                        <span className="text-white font-bold">{formatPKR(costVal)}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span>Retail Potential:</span>
                        <span className="text-white font-bold text-right">{formatPKR(priceVal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
