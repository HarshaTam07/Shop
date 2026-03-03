"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Transaction } from "@/types";
import ReceiptModal from "@/components/ReceiptModal";
import toast from "react-hot-toast";
import { exportTransactionsToExcel, exportTransactionsToPDF } from "@/utils/exportUtils";

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  const handleDelete = (transaction: Transaction) => {
    if (confirm(`Delete transaction${transaction.name ? ` for ${transaction.name}` : ''}?`)) {
      deleteTransaction(transaction.id);
      toast.success("Transaction deleted");
    }
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) {
      toast.error("No transactions selected");
      return;
    }

    if (confirm(`Delete ${selectedTransactions.size} selected transaction(s)?`)) {
      selectedTransactions.forEach(id => deleteTransaction(id));
      setSelectedTransactions(new Set());
      toast.success(`${selectedTransactions.size} transaction(s) deleted`);
    }
  };

  const toggleTransactionSelection = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((transaction) => {
        const nameMatch = transaction.name?.toLowerCase().includes(query);
        const dateMatch = new Date(transaction.createdAt).toLocaleString().toLowerCase().includes(query);
        const amountMatch = transaction.finalTotal.toString().includes(query);
        const itemsMatch = transaction.lines.some(line => line.name.toLowerCase().includes(query));
        
        return nameMatch || dateMatch || amountMatch || itemsMatch;
      });
    }

    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Set end date to end of day
        if (end) {
          end.setHours(23, 59, 59, 999);
        }

        if (start && end) {
          return transactionDate >= start && transactionDate <= end;
        } else if (start) {
          return transactionDate >= start;
        } else if (end) {
          return transactionDate <= end;
        }
        return true;
      });
    }

    return filtered;
  }, [transactions, searchQuery, startDate, endDate]);

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Transactions</h1>

      {/* Compact Search and Filters */}
      <div className="mb-4 space-y-3">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, amount, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <button
            onClick={() => exportTransactionsToExcel(filteredTransactions)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>

          <button
            onClick={() => exportTransactionsToPDF(filteredTransactions)}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
            title="Export to PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[140px]">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From Date"
              className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To Date"
              className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          {(searchQuery || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          {searchQuery || startDate || endDate ? "No transactions found matching your filters" : "No transactions yet"}
        </div>
      ) : (
        <>
          {/* Bulk Actions Bar */}
          <div className="mb-4 flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Select All ({selectedTransactions.size}/{filteredTransactions.length})
              </span>
            </label>
            {selectedTransactions.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="ml-auto px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedTransactions.size})
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-all ${
                  selectedTransactions.has(transaction.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(transaction.id)}
                        onChange={() => toggleTransactionSelection(transaction.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === transaction.id ? null : transaction.id)}
                      >
                        {transaction.name && (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {transaction.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                          {transaction.lines.length} item{transaction.lines.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ₹{(transaction.finalTotal + (transaction.debtPayment?.amount || 0) + (transaction.customAmount || 0)).toFixed(2)}
                        </p>
                        {(transaction.debtPayment || transaction.customAmount) && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Cart: ₹{transaction.finalTotal.toFixed(2)}
                            {transaction.debtPayment && ` + Debt: ₹${transaction.debtPayment.amount.toFixed(2)}`}
                            {transaction.customAmount && ` + Custom: ₹${transaction.customAmount.toFixed(2)}`}
                          </p>
                        )}
                        {transaction.paidAmount !== undefined && transaction.paidAmount < (transaction.finalTotal + (transaction.debtPayment?.amount || 0) + (transaction.customAmount || 0)) && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            Paid: ₹{transaction.paidAmount.toFixed(2)}
                          </p>
                        )}
                        <p className={`text-xs font-semibold ${
                          (transaction.status === "PAID" || !transaction.status) 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-orange-600 dark:text-orange-400"
                        }`}>
                          {transaction.status || "PAID"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingReceipt(transaction);
                        }}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="View Receipt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(transaction);
                        }}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === transaction.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Items:</h3>
                    <div className="space-y-1.5">
                      {transaction.lines.map((line) => (
                        <div
                          key={line.id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            {line.name} × {line.qty}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            ₹{line.finalLineTotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Computed Total:</span>
                        <span>₹{transaction.computedTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white mt-1">
                        <span>Cart Total:</span>
                        <span>₹{transaction.finalTotal.toFixed(2)}</span>
                      </div>
                      {transaction.debtPayment && transaction.debtPayment.amount > 0 && (
                        <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-1">
                          <span>Debt Payment ({transaction.debtPayment.customerName}):</span>
                          <span className="font-semibold">₹{transaction.debtPayment.amount.toFixed(2)}</span>
                        </div>
                      )}
                      {transaction.customAmount && transaction.customAmount > 0 && (
                        <div className="flex justify-between text-xs text-purple-600 dark:text-purple-400 mt-1">
                          <span>Custom Amount:</span>
                          <span className="font-semibold">₹{transaction.customAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {((transaction.debtPayment && transaction.debtPayment.amount > 0) || (transaction.customAmount && transaction.customAmount > 0)) && (
                        <div className="flex justify-between font-bold text-sm text-green-600 dark:text-green-400 mt-1 border-t border-gray-300 dark:border-gray-600 pt-1">
                          <span>Grand Total:</span>
                          <span>₹{(transaction.finalTotal + (transaction.debtPayment?.amount || 0) + (transaction.customAmount || 0)).toFixed(2)}</span>
                        </div>
                      )}
                      {transaction.paidAmount !== undefined && (
                        <>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <span>Paid Amount:</span>
                            <span className="font-semibold">₹{transaction.paidAmount.toFixed(2)}</span>
                          </div>
                          {transaction.paidAmount < (transaction.finalTotal + (transaction.debtPayment?.amount || 0) + (transaction.customAmount || 0)) && (
                            <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400 mt-1 font-semibold">
                              <span>Balance Due:</span>
                              <span>₹{((transaction.finalTotal + (transaction.debtPayment?.amount || 0) + (transaction.customAmount || 0)) - transaction.paidAmount).toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <ReceiptModal
        transaction={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
      />
    </div>
  );
}
