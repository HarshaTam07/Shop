"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Item, Weight, SizeType, Category, ItemType } from "@/types";
import toast from "react-hot-toast";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Item | null;
}

export default function ItemFormModal({ isOpen, onClose, editingItem }: ItemFormModalProps) {
  const { addItem, updateItem } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    metaNames: "",
    quantity: "",
    weight: "" as Weight | "",
    sizeType: "" as SizeType | "",
    category: "" as Category | "",
    type: "" as ItemType | "",
    amount: "",
    purchasedAmount: "",
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        metaNames: editingItem.metaNames.join(", "),
        quantity: editingItem.quantity.toString(),
        weight: editingItem.weight || "",
        sizeType: editingItem.sizeType || "",
        category: editingItem.category || "",
        type: editingItem.type || "",
        amount: editingItem.amount.toString(),
        purchasedAmount: editingItem.purchasedAmount?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        metaNames: "",
        quantity: "",
        weight: "",
        sizeType: "",
        category: "",
        type: "",
        amount: "",
        purchasedAmount: "",
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.quantity || !formData.amount) {
      toast.error("Name, quantity, and amount are required");
      return;
    }

    const item: Item = {
      id: editingItem?.id || `item-${Date.now()}`,
      name: formData.name,
      metaNames: formData.metaNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      quantity: parseFloat(formData.quantity),
      weight: formData.weight || undefined,
      sizeType: formData.sizeType || undefined,
      category: formData.category || undefined,
      type: formData.type || undefined,
      amount: parseFloat(formData.amount),
      purchasedAmount: formData.purchasedAmount ? parseFloat(formData.purchasedAmount) : undefined,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    if (editingItem) {
      updateItem(editingItem.id, item);
      toast.success("Item updated");
    } else {
      addItem(item);
      toast.success("Item added");
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingItem ? "Edit Item" : "Add Item"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Meta Names (comma-separated keywords)
              </label>
              <input
                type="text"
                value={formData.metaNames}
                onChange={(e) => setFormData({ ...formData, metaNames: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., soap, bath, hygiene"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Weight
                </label>
                <select
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value as Weight | "" })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select weight</option>
                  {["5gms", "10gms", "25gms", "50gms", "100gms", "250gms", "500gms", "1Kg", "2Kg", "5kg", "10kg", "25kg"].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Size Type
                </label>
                <select
                  value={formData.sizeType}
                  onChange={(e) => setFormData({ ...formData, sizeType: e.target.value as SizeType | "" })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select size type</option>
                  {["size", "individual", "case", "bag"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ItemType | "" })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select type</option>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category | "" })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select category</option>
                {["Personal Care Products", "Food", "Britania", "ITC", "Hindustan", "Household & Cleaning Supplies", "Drinks", "Cooking Oils & Sauces", "Spices & Seasonings", "Tea and Cofee", "Grains & Rice", "Pulses & Lentils", "Dairy", "General"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Selling Price *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Purchased Price
                </label>
                <input
                  type="number"
                  value={formData.purchasedAmount}
                  onChange={(e) => setFormData({ ...formData, purchasedAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {editingItem ? "Update" : "Add"}
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
