import React from "react";
import { formatPKR } from "../utils";

interface PrintTemplateProps {
  data: {
    type: "invoice" | "customer-receipt" | "vendor-receipt";
    customer?: any;
    vendor?: any;
    invoice?: any;
    payments?: any[];
    currentPayment?: {
      amount: number;
      date: string;
      notes?: string;
    };
  } | null;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ data }) => {
  if (!data) return null;

  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div id="print-area" className="p-8 text-black bg-white select-none">
      {/* Header Bar */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">Hashmi Fabrics</h1>
          <p className="text-xs text-gray-600 font-medium">Mill Directory, Wholesale & Retail Fabrics Stockist</p>
          <p className="text-[10px] text-gray-500 mt-1">Faisalabad, Pakistan • Phone: 0300-1234567 • Email: info@hashmifabrics.com</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm">
            {data.type === "invoice" && "Sales Invoice"}
            {data.type === "customer-receipt" && "Payment Receipt"}
            {data.type === "vendor-receipt" && "Supplier Voucher"}
          </span>
          <p className="text-[10px] text-gray-500 mt-2 font-mono">Printed: {todayStr}</p>
        </div>
      </div>

      {/* Type-Specific Content */}
      {data.type === "invoice" && data.invoice && (
        <div className="space-y-6">
          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-gray-300 p-3 rounded">
              <p className="text-gray-500 font-bold uppercase text-[9px] mb-1">Bill To:</p>
              <p className="font-bold text-sm text-black">{data.invoice.customer_name}</p>
              {data.invoice.customer_phone && (
                <p className="text-gray-600 font-mono mt-1">Phone: {data.invoice.customer_phone}</p>
              )}
            </div>
            <div className="border border-gray-300 p-3 rounded grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-500 font-bold uppercase text-[9px]">Invoice No:</p>
                <p className="font-bold text-black font-mono">{data.invoice.invoice_no}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold uppercase text-[9px]">Billing Date:</p>
                <p className="font-bold text-black font-mono">{data.invoice.date}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold uppercase text-[9px]">Payment Method:</p>
                <p className="font-bold text-black uppercase">{data.invoice.payment_type}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold uppercase text-[9px]">Status:</p>
                <p className={`font-bold uppercase ${data.invoice.balance > 0 ? "text-amber-600" : "text-green-600"}`}>
                  {data.invoice.balance > 0 ? "Credit / Udhar" : "Paid & Settled"}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-t border-b border-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Fabric / Product Description</th>
                  <th className="py-2.5 px-3 text-center">Qty / Met</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 border-b border-gray-300">
                {data.invoice.items?.map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td className="py-2 px-3 font-mono text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold">{item.product_name || "Unknown Product"}</td>
                    <td className="py-2 px-3 text-center font-mono">{item.qty}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatPKR(item.unit_price)}</td>
                    <td className="py-2 px-3 text-right font-bold font-mono">{formatPKR(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Panel */}
          <div className="flex justify-end">
            <div className="w-1/2 border border-gray-300 rounded p-4 space-y-1.5 text-xs bg-gray-50">
              <div className="flex justify-between text-gray-600">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-medium">{formatPKR(data.invoice.subtotal)}</span>
              </div>
              {data.invoice.discount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Special Discount:</span>
                  <span className="font-mono">- {formatPKR(data.invoice.discount)}</span>
                </div>
              )}
              <hr className="border-gray-300" />
              <div className="flex justify-between text-black font-extrabold text-sm">
                <span>Total Due:</span>
                <span className="font-mono">{formatPKR(data.invoice.total)}</span>
              </div>
              <div className="flex justify-between text-green-700 font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatPKR(data.invoice.paid)}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-red-600 font-extrabold">
                <span>Outstanding Udhar:</span>
                <span className="font-mono">{formatPKR(data.invoice.balance)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {data.type === "customer-receipt" && data.customer && (
        <div className="space-y-6">
          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-gray-300 p-3 rounded">
              <p className="text-gray-500 font-bold uppercase text-[9px] mb-1">Customer Account:</p>
              <p className="font-bold text-sm text-black">{data.customer.name}</p>
              {data.customer.phone && (
                <p className="text-gray-600 font-mono mt-1">Phone: {data.customer.phone}</p>
              )}
              <p className="text-gray-500 mt-2">Segment: <span className="font-bold uppercase text-black">{data.customer.type}</span></p>
            </div>
            <div className="border border-gray-300 p-3 rounded flex flex-col justify-between">
              <div>
                <p className="text-gray-500 font-bold uppercase text-[9px]">Receipt Summary:</p>
                <p className="font-bold text-sm text-green-600 mt-1">Cash Udhar Settlement Deposit</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-gray-200 pt-2 mt-2">
                <div>
                  <p className="text-gray-500 text-[9px] uppercase font-bold">Processed Date:</p>
                  <p className="font-bold font-mono text-black">{data.currentPayment?.date || todayStr.split(" at")[0]}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[9px] uppercase font-bold">Deposit Amount:</p>
                  <p className="font-bold font-mono text-green-600">{formatPKR(data.currentPayment?.amount || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Payment Acknowledgment Block */}
          <div className="bg-green-50 border border-green-300 rounded p-4 text-center">
            <p className="text-xs text-green-800 font-semibold uppercase tracking-wider">Transaction Received & Confirmed</p>
            <p className="text-2xl font-black text-green-600 font-mono mt-1">{formatPKR(data.currentPayment?.amount || 0)}</p>
            <p className="text-[10px] text-gray-500 mt-1 font-medium">Successfully credited towards the outstanding Udhar balance.</p>
          </div>

          {/* Financial Standings Summary */}
          <div className="border border-gray-300 rounded p-3 text-xs bg-gray-50 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-gray-500 font-bold uppercase text-[9px] block">Previous Udhar:</span>
              <span className="font-bold font-mono text-gray-700 text-sm">
                {formatPKR((data.customer.balance || 0) + (data.currentPayment?.amount || 0))}
              </span>
            </div>
            <div className="border-l border-r border-gray-300">
              <span className="text-gray-500 font-bold uppercase text-[9px] block text-green-700">Amount Received Today:</span>
              <span className="font-bold font-mono text-green-600 text-sm">{formatPKR(data.currentPayment?.amount || 0)}</span>
            </div>
            <div>
              <span className="text-gray-500 font-bold uppercase text-[9px] block">Remaining Udhar:</span>
              <span className="font-bold font-mono text-red-600 text-sm">{formatPKR(data.customer.balance || 0)}</span>
            </div>
          </div>

          {/* Complete Payment History Table */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
              Complete Payment History (All Payments Received)
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 font-bold uppercase text-[9px] text-gray-700">
                  <th className="py-2 px-3">Payment Date</th>
                  <th className="py-2 px-3">Reference / Category</th>
                  <th className="py-2 px-3 text-right pr-4">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.payments && data.payments.length > 0 ? (
                  data.payments.map((p: any, idx: number) => {
                    const isNewest = idx === data.payments!.length - 1;
                    return (
                      <tr key={p.id || idx} className={isNewest ? "bg-green-50/50 font-semibold" : ""}>
                        <td className="py-2 px-3 font-mono">{p.date}</td>
                        <td className="py-2 px-3">
                          {p.invoice_id ? `Invoice ID: ${p.invoice_id}` : "Direct Cash Payment"}
                          {isNewest && " (Today's Deposit)"}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono pr-4 ${isNewest ? "text-green-600 font-bold" : "text-gray-800"}`}>
                          {formatPKR(p.amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-400 italic">No transaction history logged</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.type === "vendor-receipt" && data.vendor && (
        <div className="space-y-6">
          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-gray-300 p-3 rounded">
              <p className="text-gray-500 font-bold uppercase text-[9px] mb-1">Supplier Mill Account:</p>
              <p className="font-bold text-sm text-black">{data.vendor.name}</p>
              {data.vendor.city && <p className="text-gray-600 mt-1">City: {data.vendor.city}</p>}
              {data.vendor.phone && (
                <p className="text-gray-600 font-mono mt-1">Phone: {data.vendor.phone}</p>
              )}
            </div>
            <div className="border border-gray-300 p-3 rounded flex flex-col justify-between">
              <div>
                <p className="text-gray-500 font-bold uppercase text-[9px]">Voucher Summary:</p>
                <p className="font-bold text-sm text-blue-600 mt-1">Outwards Cash Payment Settlement</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-gray-200 pt-2 mt-2">
                <div>
                  <p className="text-gray-500 text-[9px] uppercase font-bold">Payment Date:</p>
                  <p className="font-bold font-mono text-black">{data.currentPayment?.date || todayStr.split(" at")[0]}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[9px] uppercase font-bold">Settled Amount:</p>
                  <p className="font-bold font-mono text-blue-600">{formatPKR(data.currentPayment?.amount || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Payment Acknowledgment Block */}
          <div className="bg-blue-50 border border-blue-300 rounded p-4 text-center">
            <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider">Outwards Payment Processed</p>
            <p className="text-2xl font-black text-blue-600 font-mono mt-1">{formatPKR(data.currentPayment?.amount || 0)}</p>
            {data.currentPayment?.notes && (
              <p className="text-[10px] text-gray-500 mt-1.5 font-medium">Memo: "{data.currentPayment.notes}"</p>
            )}
          </div>

          {/* Financial Standings Summary */}
          <div className="border border-gray-300 rounded p-3 text-xs bg-gray-50 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-gray-500 font-bold uppercase text-[9px] block">Previous Dues Payable:</span>
              <span className="font-bold font-mono text-gray-700 text-sm">
                {formatPKR((data.vendor.balance || 0) + (data.currentPayment?.amount || 0))}
              </span>
            </div>
            <div className="border-l border-r border-gray-300">
              <span className="text-gray-500 font-bold uppercase text-[9px] block text-blue-700">Amount Settled Today:</span>
              <span className="font-bold font-mono text-blue-600 text-sm">{formatPKR(data.currentPayment?.amount || 0)}</span>
            </div>
            <div>
              <span className="text-gray-500 font-bold uppercase text-[9px] block">Remaining Payable:</span>
              <span className="font-bold font-mono text-red-600 text-sm">{formatPKR(data.vendor.balance || 0)}</span>
            </div>
          </div>

          {/* Complete Payment History Table */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
              Complete Settled Ledger (All Payments to Supplier)
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 font-bold uppercase text-[9px] text-gray-700">
                  <th className="py-2 px-3">Date Paid</th>
                  <th className="py-2 px-3">Notes / Memo Reference</th>
                  <th className="py-2 px-3 text-right pr-4">Amount Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.payments && data.payments.length > 0 ? (
                  data.payments.map((p: any, idx: number) => {
                    const isNewest = idx === data.payments!.length - 1;
                    return (
                      <tr key={p.id || idx} className={isNewest ? "bg-blue-50/50 font-semibold" : ""}>
                        <td className="py-2 px-3 font-mono">{p.date}</td>
                        <td className="py-2 px-3">
                          {p.notes || "Standard Supplier Account Settlement"}
                          {isNewest && " (Today's Payment)"}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono pr-4 ${isNewest ? "text-blue-600 font-bold" : "text-gray-800"}`}>
                          {formatPKR(p.amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-400 italic">No transaction history logged</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Branding for legal/official validation */}
      <div className="mt-12 pt-4 border-t border-gray-300 flex justify-between items-end text-[10px] text-gray-400">
        <div>
          <p className="font-bold text-gray-600 uppercase">System-Generated Document</p>
          <p>Managed using Hashmi Fabrics Business Management Suite.</p>
        </div>
        <div className="text-right w-1/3 border-t border-dashed border-gray-400 pt-6">
          <p className="text-gray-600 font-bold">Authorized Signature / Stamp</p>
        </div>
      </div>
    </div>
  );
};
