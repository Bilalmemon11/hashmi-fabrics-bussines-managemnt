import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // Prevent scrolling behind modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#1c2233] border border-[#2a3248] rounded-2xl p-6 w-full max-w-[540px] max-h-[85vh] overflow-y-auto flex flex-col gap-4 shadow-2xl relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3248] pb-4">
          <h2 className="text-[#e8eaf0] font-bold text-base tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8892a4] hover:text-white hover:bg-[#161b27] p-1.5 rounded-lg border border-transparent hover:border-[#2a3248] transition-all duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-[#e8eaf0]">{children}</div>
      </div>
    </div>
  );
};
