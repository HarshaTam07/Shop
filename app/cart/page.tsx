"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Transaction, Debt } from "@/types";

export default function CartPage() {
  const { cart, updateCartLine, removeFromCart, clearCart, createTransaction, addDebt, debts, payDebt } = useStore();
  const router = useRouter();
  const [transactionName, setTransactionName] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  const computedTotal = cart.reduce((sum, line) => sum + line.computedLineTotal, 0);
  const finalTotal = cart.reduce((sum, line) => sum + line.finalLineTotal, 0);
  
  // Get selected debt details
  const selectedDebt = debts.find(d => d.id === selectedDebtId && d.status === "OPEN");
  const debtAmount = selectedDebt ? selectedDebt.balance : 0;
  const customAmountValue = customAmount ? parseFloat(customAmount) : 0;
  const grandTotal = finalTotal + debtAmount + customAmountValue;
  
  // Get open debts for dropdown
  const openDebts = debts.filter(d => d.status === "OPEN");

  const handlePaid = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const paid = paidAmount ? parseFloat(paidAmount) : grandTotal;

    // If paid amount is less than grand total, customer name is required
    if (paid < grandTotal) {
      if (!transactionName.trim()) {
        toast.error("Customer name is required when paying less than the total amount");
        return;
      }
    }

    if (paid < 0) {
      toast.error("Paid amount cannot be negative");
      return;
    }

    if (paid > grandTotal) {
      toast.error("Paid amount cannot be more than the grand total");
      return;
    }

    // Calculate how much goes to cart vs debt vs custom
    let cartPayment = 0;
    let debtPayment = 0;
    let customPayment = 0;

    if (selectedDebt || customAmountValue > 0) {
      // First, cover the cart total
      cartPayment = Math.min(paid, finalTotal);
      const remaining = paid - cartPayment;
      
      // Then cover debt if selected
      if (selectedDebt && remaining > 0) {
        debtPayment = Math.min(remaining, debtAmount);
        const afterDebt = remaining - debtPayment;
        
        // Finally, custom amount
        if (customAmountValue > 0 && afterDebt > 0) {
          customPayment = Math.min(afterDebt, customAmountValue);
        }
      } else if (customAmountValue > 0 && remaining > 0) {
        // No debt, just custom amount
        customPayment = Math.min(remaining, customAmountValue);
      }
    } else {
      cartPayment = paid;
    }

    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      name: transactionName.trim() || undefined,
      createdAt: new Date().toISOString(),
      lines: [...cart],
      computedTotal,
      finalTotal,
      customAmount: customAmountValue > 0 ? customAmountValue : undefined,
      debtPayment: selectedDebt && debtPayment > 0 ? { 
        customerName: selectedDebt.customerName, 
        amount: debtPayment 
      } : undefined,
      paidAmount: paid,
      status: paid < grandTotal ? "PARTIAL" : "PAID",
    };

    createTransaction(transaction);

    // Handle debt payment if a debt was selected
    if (selectedDebt && debtPayment > 0) {
      payDebt(selectedDebt.id, debtPayment);
      if (debtPayment >= selectedDebt.balance) {
        toast.success(`Debt of ₹${selectedDebt.balance.toFixed(2)} for ${selectedDebt.customerName} fully cleared!`);
      } else {
        toast.success(`₹${debtPayment.toFixed(2)} paid toward ${selectedDebt.customerName}'s debt. Remaining: ₹${(selectedDebt.balance - debtPayment).toFixed(2)}`);
      }
    }

    // If cart payment is less than cart total, create a new debt for cart balance
    if (cartPayment < finalTotal) {
      const remainingBalance = finalTotal - cartPayment;
      const debt: Debt = {
        id: `debt-${Date.now()}`,
        customerName: transactionName.trim(),
        date: new Date().toISOString(),
        totalOwed: remainingBalance,
        totalPaid: 0,
        balance: remainingBalance,
        history: [],
        status: "OPEN",
      };
      addDebt(debt);
      toast.success(`Transaction completed! Cart debt of ₹${remainingBalance.toFixed(2)} created for ${transactionName.trim()}`);
    } else if (!selectedDebt || debtPayment === 0) {
      toast.success("Transaction completed!");
    }

    clearCart();
    setTransactionName("");
    setPaidAmount("");
    setSelectedDebtId("");
    setCustomAmount("");
    router.push("/transactions");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Your cart is empty
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Computed Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Final Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {cart.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{line.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={line.qty}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 1;
                          updateCartLine(line.id, { qty });
                        }}
                        className="w-20 px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">₹{line.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">₹{line.computedLineTotal.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.finalLineTotal}
                        onChange={(e) => {
                          const finalLineTotal = parseFloat(e.target.value) || 0;
                          updateCartLine(line.id, { finalLineTotal });
                        }}
                        className="w-24 px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          removeFromCart(line.id);
                          toast.success("Removed from cart");
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md ml-auto">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Transaction Name (Optional)
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    (Required if paying less than total)
                  </span>
                </label>
                <input
                  type="text"
                  value={transactionName}
                  onChange={(e) => setTransactionName(e.target.value)}
                  placeholder="e.g., Customer Name, Bill #123"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>

              {openDebts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Add Debt Payment (Optional)
                  </label>
                  <select
                    value={selectedDebtId}
                    onChange={(e) => setSelectedDebtId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  >
                    <option value="">No debt payment</option>
                    {openDebts.map((debt) => (
                      <option key={debt.id} value={debt.id}>
                        {debt.customerName} - ₹{debt.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {selectedDebt && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Adding ₹{selectedDebt.balance.toFixed(2)} debt payment for {selectedDebt.customerName}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Add Custom Amount (Optional)
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    (e.g., previous balance, extra charges)
                  </span>
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
                {customAmountValue > 0 && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Adding ₹{customAmountValue.toFixed(2)} custom amount
                  </p>
                )}
              </div>

              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Computed Total:</span>
                <span>₹{computedTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t pt-3">
                <span>Cart Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
              
              {selectedDebt && (
                <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                  <span>+ Debt Payment:</span>
                  <span>₹{debtAmount.toFixed(2)}</span>
                </div>
              )}
              
              {customAmountValue > 0 && (
                <div className="flex justify-between text-sm text-purple-600 dark:text-purple-400">
                  <span>+ Custom Amount:</span>
                  <span>₹{customAmountValue.toFixed(2)}</span>
                </div>
              )}
              
              {(selectedDebt || customAmountValue > 0) && (
                <div className="flex justify-between text-xl font-bold text-green-600 dark:text-green-400 border-t pt-2">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Paid Amount (Optional)
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    (Leave empty for full payment)
                  </span>
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={grandTotal.toFixed(2)}
                  min="0"
                  max={grandTotal}
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
                {paidAmount && parseFloat(paidAmount) < grandTotal && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Remaining ₹{(grandTotal - parseFloat(paidAmount)).toFixed(2)} will be added to debts
                  </p>
                )}
              </div>
              <button
                onClick={handlePaid}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
              >
                Paid
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
