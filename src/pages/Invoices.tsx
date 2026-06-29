import React, { useState, useEffect } from "react";
import { Topbar } from "../components/Topbar";
import { StatCard } from "../components/StatCard";
import { Modal } from "../components/Modal";
import { useApp } from "../context/AppContext";
import { formatPKR } from "../utils";
import {
  FileText,
  BadgeDollarSign,
  User,
  Plus,
  Trash2,
  Eye,
  FileDown,
} from "lucide-react";
import api from "../services/api";

interface InvoiceItemForm {
  product_id: number;
  qty: number;
  unit_price: number;
  total: number;
}

export const Invoices: React.FC = () => {
  const {
    invoices,
    customers,
    products,
    addInvoice,
    deleteInvoice,
    loading,
    alert,
    triggerPrint,
  } = useApp();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState<number>(0);
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [lineItems, setLineItems] = useState<InvoiceItemForm[]>([
    { product_id: 0, qty: 1, unit_price: 0, total: 0 },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"cash" | "credit">("cash");

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);
  const total = Math.max(0, subtotal - discount);
  const balance = Math.max(0, total - amountPaid);

  // Automatically update paid amount if payment type is cash
  useEffect(() => {
    if (paymentType === "cash") {
      setAmountPaid(total);
    }
  }, [paymentType, total]);

  // Calculations for Stat Cards
  const totalInvoicesCount = invoices.length;
  const totalSalesVolume = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalOutstandingUdhar = invoices.reduce((sum, i) => sum + i.balance, 0);

  // Handle line item product selection change
  const handleProductChange = (index: number, productId: number) => {
    const product = products.find((p) => p.id === productId);
    const updated = [...lineItems];
    updated[index].product_id = productId;
    if (product) {
      updated[index].unit_price = product.price;
      updated[index].total = updated[index].qty * product.price;
    } else {
      updated[index].unit_price = 0;
      updated[index].total = 0;
    }
    setLineItems(updated);
  };

  // Handle line item quantity change
  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index].qty = Math.max(0, qty);
    updated[index].total = updated[index].qty * updated[index].unit_price;
    setLineItems(updated);
  };

  // Handle line item price manual override
  const handlePriceChange = (index: number, price: number) => {
    const updated = [...lineItems];
    updated[index].unit_price = Math.max(0, price);
    updated[index].total = updated[index].qty * updated[index].unit_price;
    setLineItems(updated);
  };

  const addLineItemRow = () => {
    setLineItems([...lineItems, { product_id: 0, qty: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItemRow = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Open Invoice Viewer
  const handleViewInvoice = async (id: number) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      if (res.data && res.data.success) {
        setSelectedInvoice(res.data.data);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error("Error viewing invoice:", error);
    }
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert?.text || console.error("Please select a customer");
      return;
    }

    const validItems = lineItems.filter((i) => i.product_id > 0 && i.qty > 0);
    if (validItems.length === 0) {
      console.error("Please add at least one valid product line");
      return;
    }

    const payload = {
      customer_id: customerId,
      date: invoiceDate,
      subtotal,
      discount,
      total,
      paid: amountPaid,
      balance,
      payment_type: paymentType,
      items: validItems,
    };

    const createdInvoice = await addInvoice(payload);
    if (createdInvoice) {
      // Reset Form State
      setCustomerId(0);
      setInvoiceDate(new Date().toISOString().split("T")[0]);
      setLineItems([{ product_id: 0, qty: 1, unit_price: 0, total: 0 }]);
      setDiscount(0);
      setAmountPaid(0);
      setPaymentType("cash");
      setIsNewModalOpen(false);

      // Immediately print the invoice receipt PDF
      triggerPrint({ type: "invoice", invoice: createdInvoice });
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this invoice? Product stock and customer balances will be reverted.")) {
      await deleteInvoice(id);
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateString === today;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar
        title="Sales Invoices"
        action={
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#6c63ff] hover:bg-[#7c75ff] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 cursor-pointer"
          >
            <Plus size={16} /> New Invoice
          </button>
        }
      />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Stat Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Invoices Issued"
            value={totalInvoicesCount}
            sub="Total invoices"
            subColor="purple"
            icon={<FileText size={18} />}
          />
          <StatCard
            label="Total Sales Revenue"
            value={formatPKR(totalSalesVolume)}
            sub="Gross turnover"
            subColor="green"
            icon={<BadgeDollarSign size={18} />}
          />
          <StatCard
            label="Outstanding Receivables"
            value={formatPKR(totalOutstandingUdhar)}
            sub="Remaining Udhar"
            subColor="amber"
            icon={<User size={18} />}
          />
        </div>

        {/* Invoices List Table */}
        <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-5 overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[#8892a4]">
            Invoice History Ledger
          </h3>

          <div className="overflow-x-auto">
            {invoices.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-[#8892a4]/70">
                <FileText size={48} className="mb-2 text-[#8892a4]/20 animate-pulse" />
                <span className="text-sm font-medium">No sales invoices exist yet</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#e8eaf0]">
                <thead>
                  <tr className="text-[#8892a4] border-b border-[#2a3248]/60 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Total PKR</th>
                    <th className="py-3 px-4 font-semibold">Paid PKR</th>
                    <th className="py-3 px-4 font-semibold">Balance</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3248]/40">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#161b27]/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        {inv.invoice_no}
                      </td>
                      <td className="py-3 px-4 text-[#8892a4]">{inv.date}</td>
                      <td className="py-3 px-4 font-semibold">
                        {inv.customer_name}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#e8eaf0]">
                        {formatPKR(inv.total)}
                      </td>
                      <td className="py-3 px-4 text-green-400 font-medium">
                        {formatPKR(inv.paid)}
                      </td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          inv.balance > 0 ? "text-amber-400" : "text-[#8892a4]"
                        }`}
                      >
                        {inv.balance > 0 ? formatPKR(inv.balance) : "Cleared"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                            inv.payment_type === "cash"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {inv.payment_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewInvoice(inv.id)}
                            className="text-blue-400 border border-blue-500/10 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="View invoice details"
                          >
                            <Eye size={13} />
                          </button>
                          {isToday(inv.date) && (
                            <button
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="text-red-400 border border-red-500/10 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Delete invoice (Same day restriction)"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
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

      {/* MODAL: New Invoice Form */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Fabrics Invoice"
      >
        <form onSubmit={handleSaveInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Customer Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Select Customer *
              </label>
              <select
                required
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={customerId}
                onChange={(e) => setCustomerId(Number(e.target.value))}
              >
                <option value="0">Choose customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type.toUpperCase()} • Balance: {formatPKR(c.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                required
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Line Items Section */}
          <div className="border-t border-b border-[#2a3248]/50 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider text-[#8892a4]">
                Line Items (Fabric Roll Selection)
              </span>
              <button
                type="button"
                onClick={addLineItemRow}
                className="text-[#a78bfa] hover:text-white hover:bg-[#6c63ff]/10 border border-[#6c63ff]/20 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus size={12} /> Add Fabric
              </button>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  {/* Product Dropdown */}
                  <div className="flex-1">
                    <select
                      required
                      className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#6c63ff] w-full"
                      value={item.product_id}
                      onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                    >
                      <option value="0">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock_qty} {p.unit} • Price: {formatPKR(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Qty Input */}
                  <div className="w-16">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      required
                      className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#6c63ff] w-full text-center"
                      value={item.qty}
                      onChange={(e) => handleQtyChange(idx, parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Cost Price */}
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Price"
                      min="0"
                      required
                      className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#6c63ff] w-full text-center font-bold"
                      value={item.unit_price}
                      onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Row Delete */}
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItemRow(idx)}
                      className="text-red-400 hover:text-white p-1.5 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/15"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Calculations and Payment terms */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-3">
              {/* Payment Type */}
              <div>
                <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                  Payment Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType("cash")}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                      paymentType === "cash"
                        ? "bg-green-500/10 border-green-500/35 text-green-400"
                        : "border-[#2a3248] text-[#8892a4] hover:bg-[#161b27]"
                    }`}
                  >
                    Cash Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType("credit")}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                      paymentType === "credit"
                        ? "bg-amber-500/10 border-amber-500/35 text-amber-400"
                        : "border-[#2a3248] text-[#8892a4] hover:bg-[#161b27]"
                    }`}
                  >
                    Udhar (Credit)
                  </button>
                </div>
              </div>

              {/* Amount Paid input */}
              {paymentType === "credit" && (
                <div>
                  <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                    Amount Paid PKR
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={total}
                    className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                    placeholder="Enter upfront deposit"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            {/* Calculations Summary Right side */}
            <div className="bg-[#161b27] border border-[#2a3248] p-3 rounded-xl flex flex-col gap-2 justify-center">
              <div className="flex justify-between text-xs text-[#8892a4]">
                <span>Gross Subtotal:</span>
                <span className="font-medium text-[#e8eaf0]">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#8892a4] items-center">
                <span>Discount Allowed:</span>
                <input
                  type="number"
                  min="0"
                  className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded px-1.5 py-0.5 text-right text-xs w-20 focus:outline-none focus:border-[#6c63ff]"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <hr className="border-[#2a3248]/55" />
              <div className="flex justify-between text-xs font-bold text-white uppercase">
                <span>Total Due:</span>
                <span className="text-[#a78bfa]">{formatPKR(total)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-[#8892a4]">
                <span>Udhar Balance:</span>
                <span className={balance > 0 ? "text-amber-400" : "text-green-400"}>
                  {formatPKR(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-[#2a3248]/50">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="flex-1 border border-[#2a3248] text-[#e8eaf0] hover:bg-[#161b27] px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={subtotal <= 0 || !customerId}
              className="flex-1 bg-[#6c63ff] hover:bg-[#7c75ff] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Save Invoice Ledger
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View Invoice Read-Only Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Invoice Receipt — ${selectedInvoice?.invoice_no || ""}`}
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs border-b border-[#2a3248] pb-3">
              <div>
                <span className="text-[#8892a4] block">Bill To:</span>
                <span className="font-bold text-white block text-sm">
                  {selectedInvoice.customer_name}
                </span>
                {selectedInvoice.customer_phone && (
                  <span className="text-[#8892a4]">{selectedInvoice.customer_phone}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[#8892a4] block">Issue Date:</span>
                <span className="font-bold text-white block">{selectedInvoice.date}</span>
                <span className="text-[#8892a4] block mt-1">Payment Method:</span>
                <span className="text-[#a78bfa] font-bold uppercase text-[10px]">
                  {selectedInvoice.payment_type}
                </span>
              </div>
            </div>

            {/* List Table of products on receipt */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#8892a4] uppercase tracking-wider block">
                Items List
              </span>
              <div className="bg-[#161b27] border border-[#2a3248] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1c2233] text-[#8892a4] border-b border-[#2a3248]/50">
                    <tr>
                      <th className="p-2 pl-3">Fabric Product</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right pr-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a3248]/30">
                    {selectedInvoice.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-2 pl-3 font-semibold text-white">
                          {item.product_name}
                        </td>
                        <td className="p-2 text-center text-[#8892a4]">{item.qty}</td>
                        <td className="p-2 text-right text-[#8892a4]">
                          {formatPKR(item.unit_price)}
                        </td>
                        <td className="p-2 text-right font-bold text-white pr-3">
                          {formatPKR(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary panel */}
            <div className="bg-[#161b27] border border-[#2a3248]/60 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-[#8892a4]">
                <span>Gross Subtotal:</span>
                <span>{formatPKR(selectedInvoice.subtotal)}</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-[#8892a4]">
                  <span>Discount Allowed:</span>
                  <span className="text-green-400">- {formatPKR(selectedInvoice.discount)}</span>
                </div>
              )}
              <hr className="border-[#2a3248]/40" />
              <div className="flex justify-between text-white font-bold text-sm">
                <span>Final Invoice Total:</span>
                <span className="text-[#6c63ff]">{formatPKR(selectedInvoice.total)}</span>
              </div>
              <div className="flex justify-between text-green-400 font-medium">
                <span>Amount Paid:</span>
                <span>{formatPKR(selectedInvoice.paid)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold border-t border-[#2a3248]/30 pt-2">
                <span>Outstanding Udhar:</span>
                <span>{formatPKR(selectedInvoice.balance)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => triggerPrint({ type: "invoice", invoice: selectedInvoice })}
                className="flex-grow bg-[#6c63ff] hover:bg-[#7c75ff] text-white py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileDown size={14} /> Print / Save PDF
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-grow bg-[#1c2233] hover:bg-[#2a3248] border border-[#2a3248] text-[#e8eaf0] py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
