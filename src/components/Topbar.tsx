import React from "react";

interface TopbarProps {
  title: string;
  action?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({ title, action }) => {
  return (
    <header className="h-16 border-b border-[#2a3248] bg-[#161b27]/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-white font-bold text-lg tracking-tight select-none">
          {title}
        </h1>
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </header>
  );
};
