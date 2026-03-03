"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Debt } from "@/types";
import DebtPaymentModal from "@/components/DebtPaymentModal";
import toast from "react-hot-toast";
import { exportDebtsToExcel, exportDebtsToPDF } from "@/utils/exportUtils";

export default function DebtsPage() {
  const { debts, addDebt, deleteDebt } = useStore();
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDebts, setSelectedDebts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    customerName: "",
    date: new Date().toISOString().split("T")[0],
    totalOwed: "",
  });

  const filteredDebts = useMemo(() => {
    if (!searchQuery) return debts;
    
    const query = searchQuery.toLowerCase();
    return debts.filter((debt) => {
      return (
        debt.customerName.toLowerCase().includes(query) ||
        debt.totalOwed.toString().includes(query) ||
        debt.totalPaid.toString().includes(query) ||
        debt.balance.toString().includes(query) ||
        debt.status.toLowerCase().includes(query)
      );
    });
  }, [debts, searchQuery]);

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.date || !formData.totalOwed) {
      toast.error("All fields are required");
      return;
    }

    const totalOwed = parseFloat(formData.totalOwed);
    const debt: Debt = {
      id: `debt-${Date.now()}`,
      customerName: formData.customerName,
      date: new Date(formData.date).toISOString(),
      totalOwed,
      totalPaid: 0,
      balance: totalOwed,
      history: [],
      status: "OPEN",
    };

    addDebt(debt);
    setFormData({
      customerName: "",
      date: new Date().toISOString().split("T")[0],
      totalOwed: "",
    });
    toast.success("Debt added");
  };

  const handleDelete = (debt: Debt) => {
    if (confirm(`Delete debt for ${debt.customerName}?`)) {
      deleteDebt(debt.id);
      toast.success("Debt deleted");
    }
  };

  const handleBulkDelete = () => {
    if (selectedDebts.size === 0) {
      toast.error("No debts selected");
      return;
    }

    if (confirm(`Delete ${selectedDebts.size} selected debt(s)?`)) {
      selectedDebts.forEach(id => deleteDebt(id));
      setSelectedDebts(new Set());
      toast.success(`${selectedDebts.size} debt(s) deleted`);
    }
  };

  const toggleDebtSelection = (debtId: string) => {
    const newSelected = new Set(selectedDebts);
    if (newSelected.has(debtId)) {
      newSelected.delete(debtId);
    } else {
      newSelected.add(debtId);
    }
    setSelectedDebts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDebts.size === filteredDebts.length) {
      setSelectedDebts(new Set());
    } else {
      setSelectedDebts(new Set(filteredDebts.map(d => d.id)));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Debts</h1>

      {/* Compact Search Bar */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by customer name, amount, or status..."
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
          onClick={() => exportDebtsToExcel(filteredDebts)}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
          title="Export to Excel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel
        </button>

        <button
          onClick={() => exportDebtsToPDF(filteredDebts)}
          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
          title="Export to PDF"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Add New Debt</h2>
        <form onSubmit={handleAddDebt} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                Total Owed *
              </label>
              <input
                type="number"
                value={formData.totalOwed}
                onChange={(e) => setFormData({ ...formData, totalOwed: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Debt
          </button>
        </form>
      </div>

      {filteredDebts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          {searchQuery ? "No debts found matching your search" : "No debts recorded"}
        </div>
      ) : (
        <>
          {/* Bulk Actions Bar */}
          <div className="mb-4 flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDebts.size === filteredDebts.length && filteredDebts.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Select All ({selectedDebts.size}/{filteredDebts.length})
              </span>
            </label>
            {selectedDebts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="ml-auto px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedDebts.size})
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredDebts.map((debt) => (
              <div
                key={debt.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all ${
                  selectedDebts.has(debt.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedDebts.has(debt.id)}
                      onChange={() => toggleDebtSelection(debt.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {debt.customerName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(debt.date).toLocaleDateString()}
                      </p>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Total Owed: <span className="font-semibold">₹{debt.totalOwed.toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Total Paid: <span className="font-semibold">₹{debt.totalPaid.toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Balance: <span className="font-semibold text-red-600 dark:text-red-400">₹{debt.balance.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-center ${
                        debt.status === "SETTLED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {debt.status}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDelete(debt)}
                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      {debt.status === "OPEN" && (
                        <button
                          onClick={() => setPayingDebt(debt)}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {debt.history.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Payment History:
                    </h4>
                    <div className="space-y-0.5">
                      {debt.history.map((h) => (
                        <p key={h.id} className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(h.date).toLocaleDateString()} - ₹{h.amountPaid.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <DebtPaymentModal
        debt={payingDebt}
        onClose={() => setPayingDebt(null)}
      />
    </div>
  );
}
