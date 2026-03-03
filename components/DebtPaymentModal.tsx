"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Debt, DebtHistory } from "@/types";
import toast from "react-hot-toast";

interface DebtPaymentModalProps {
  debt: Debt | null;
  onClose: () => void;
}

export default function DebtPaymentModal({ debt, onClose }: DebtPaymentModalProps) {
  const { updateDebt } = useStore();
  const [amountPaid, setAmountPaid] = useState("");

  useEffect(() => {
    setAmountPaid("");
  }, [debt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!debt) return;

    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > debt.balance) {
      toast.error("Amount cannot exceed balance");
      return;
    }

    const historyEntry: DebtHistory = {
      id: `payment-${Date.now()}`,
      date: new Date().toISOString(),
      amountPaid: amount,
    };

    const newTotalPaid = debt.totalPaid + amount;
    const newBalance = Math.max(0, debt.totalOwed - newTotalPaid);

    const updatedDebt: Debt = {
      ...debt,
      totalPaid: newTotalPaid,
      balance: newBalance,
      history: [...debt.history, historyEntry],
      status: newBalance <= 0 ? "SETTLED" : "OPEN",
    };

    updateDebt(debt.id, updatedDebt);
    toast.success("Payment recorded");
    onClose();
  };

  if (!debt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Record Payment
          </h2>

          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Customer: <span className="font-semibold">{debt.customerName}</span>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Balance: <span className="font-semibold text-red-600 dark:text-red-400">₹{debt.balance.toFixed(2)}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Amount Paid *
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="0.01"
                max={debt.balance}
                step="0.01"
                placeholder="Enter amount"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Record Payment
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
