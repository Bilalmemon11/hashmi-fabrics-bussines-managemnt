import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  Boxes,
  Briefcase,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Percent,
} from "lucide-react";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent ${
          isActive
            ? "bg-[#6c63ff]/15 text-[#a78bfa] border-[#6c63ff]/30 shadow-md shadow-[#6c63ff]/5"
            : "text-[#8892a4] hover:bg-[#1c2233] hover:text-[#e8eaf0]"
        }`
      }
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#161b27] border-r border-[#2a3248] flex flex-col h-screen sticky top-0 shrink-0 z-10">
      {/* Branding */}
      <div className="p-6 border-b border-[#2a3248] flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="thread">🧵</span>
          <span className="text-[#e8eaf0] font-bold text-lg tracking-tight">
            Hashmi Fabrics
          </span>
        </div>
        <span className="text-xs font-medium text-[#8892a4] tracking-wider uppercase pl-7">
          Business Management
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Core Dashboard */}
        <div className="space-y-1">
          <NavItem to="/" label="Dashboard" icon={<LayoutDashboard size={18} />} />
        </div>

        {/* Sales Group */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8892a4]/60 px-3 mb-2">
            Sales
          </div>
          <div className="space-y-1">
            <NavItem to="/invoices" label="Invoices" icon={<Receipt size={18} />} />
            <NavItem to="/customers" label="Customers" icon={<Users size={18} />} />
          </div>
        </div>

        {/* Stock Group */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8892a4]/60 px-3 mb-2">
            Stock
          </div>
          <div className="space-y-1">
            <NavItem to="/products" label="Products" icon={<Package size={18} />} />
            <NavItem to="/inventory" label="Inventory" icon={<Boxes size={18} />} />
          </div>
        </div>

        {/* Finance Group */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8892a4]/60 px-3 mb-2">
            Finance
          </div>
          <div className="space-y-1">
            <NavItem to="/vendors" label="Vendors" icon={<Briefcase size={18} />} />
            <NavItem to="/purchases" label="Purchases" icon={<ShoppingCart size={18} />} />
            <NavItem to="/expenses" label="Expenses" icon={<Wallet size={18} />} />
          </div>
        </div>

        {/* Analytics Group */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8892a4]/60 px-3 mb-2">
            Analytics
          </div>
          <div className="space-y-1">
            <NavItem to="/reports" label="Reports" icon={<TrendingUp size={18} />} />
            <NavItem to="/profit-loss" label="Profit & Loss" icon={<Percent size={18} />} />
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-[#2a3248] text-center">
        <span className="text-[11px] font-mono text-[#8892a4]/50">
          v1.0.0 • Dark Engine
        </span>
      </div>
    </aside>
  );
};
