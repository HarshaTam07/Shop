"use client";

import { Transaction } from "@/types";

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Hidden on print */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center print:hidden">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Receipt</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              title="Print"
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Receipt Content - Thermal printer style */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="receipt-paper mx-auto" style={{ maxWidth: '80mm', fontFamily: 'monospace' }}>
            {/* Shop Header */}
            <div className="text-center mb-4 border-b-2 border-dashed border-gray-400 pb-3">
              <h1 className="text-xl font-bold mb-1">SHOP</h1>
              <p className="text-xs">Thank you for your purchase</p>
            </div>

            {/* Transaction Info */}
            <div className="text-xs mb-3 space-y-1">
              {transaction.name && (
                <div className="flex justify-between">
                  <span className="font-semibold">Customer:</span>
                  <span>{transaction.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold">Date:</span>
                <span>{new Date(transaction.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Bill #:</span>
                <span>{transaction.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t-2 border-dashed border-gray-400 pt-2 mb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-1">Item</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Price</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.lines.map((line, index) => (
                    <tr key={line.id} className={index !== transaction.lines.length - 1 ? "border-b border-gray-200" : ""}>
                      <td className="py-2 pr-2">
                        <div className="break-words">{line.name}</div>
                      </td>
                      <td className="text-center py-2">{line.qty}</td>
                      <td className="text-right py-2">₹{line.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-2 font-semibold">₹{line.finalLineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-dashed border-gray-400 pt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{transaction.computedTotal.toFixed(2)}</span>
              </div>
              {transaction.computedTotal !== transaction.finalTotal && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{(transaction.computedTotal - transaction.finalTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-gray-400 pt-2 mt-2">
                <span>CART TOTAL:</span>
                <span>₹{transaction.finalTotal.toFixed(2)}</span>
              </div>
              {transaction.customAmount && transaction.customAmount > 0 && (
                <>
                  <div className="flex justify-between text-purple-600">
                    <span>Custom Amount:</span>
                    <span>₹{transaction.customAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-gray-400 pt-2 mt-2">
                    <span>GRAND TOTAL:</span>
                    <span>₹{(transaction.finalTotal + transaction.customAmount).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Paid:</span>
                <span className="font-semibold">₹{(transaction.paidAmount ?? transaction.finalTotal).toFixed(2)}</span>
              </div>
              {(transaction.paidAmount ?? transaction.finalTotal) < (transaction.finalTotal + (transaction.customAmount || 0)) && (
                <div className="flex justify-between text-orange-600 font-semibold">
                  <span>Balance Due:</span>
                  <span>₹{((transaction.finalTotal + (transaction.customAmount || 0)) - (transaction.paidAmount ?? transaction.finalTotal)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${(transaction.status === "PAID" || !transaction.paidAmount) ? "text-green-600" : "text-orange-600"}`}>
                  {transaction.status || "PAID"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-gray-400 text-xs">
              <p className="mb-1">Items: {transaction.lines.length}</p>
              <p className="font-semibold">Thank you! Visit again!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-paper,
          .receipt-paper * {
            visibility: visible;
          }
          .receipt-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
