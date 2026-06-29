import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: "green" | "red" | "amber" | "purple" | "blue" | "default";
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  subColor = "default",
  icon,
}) => {
  const getSubColorClass = () => {
    switch (subColor) {
      case "green":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "red":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "amber":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "purple":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "blue":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-[#8892a4] bg-[#161b27]/40 border-[#2a3248]/30";
    }
  };

  return (
    <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-5 flex flex-col justify-between hover:border-[#6c63ff]/40 hover:shadow-lg hover:shadow-[#6c63ff]/2 transition-all duration-250 group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#8892a4] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-2 bg-[#161b27] text-[#a78bfa] rounded-lg border border-[#2a3248] group-hover:border-[#6c63ff]/30 group-hover:text-white transition-colors duration-250">
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 mt-1">
        <span className="text-2xl font-bold text-[#e8eaf0] tracking-tight">
          {value}
        </span>
        {sub && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border inline-block w-fit ${getSubColorClass()}`}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
};
