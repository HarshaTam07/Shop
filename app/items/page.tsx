"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Item, Weight, SizeType, Category, ItemType, CartLine } from "@/types";
import ItemFormModal from "@/components/ItemFormModal";
import toast from "react-hot-toast";
import Link from "next/link";
import { exportItemsToExcel, exportItemsToPDF } from "@/utils/exportUtils";

export default function ItemsPage() {
  const { items, cart, addToCart, deleteItem, updateCartLine, removeFromCart } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWeight, setFilterWeight] = useState<Weight | "">("");
  const [filterCategory, setFilterCategory] = useState<Category | "">("");
  const [filterType, setFilterType] = useState<ItemType | "">("");
  const [filterSizeType, setFilterSizeType] = useState<SizeType | "">("");
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [showCartSidebar, setShowCartSidebar] = useState(cart.length > 0);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      
      // Enhanced search to include weight, category, type, sizeType, price, and stock matching
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchLower) ||
        item.metaNames.some((meta) => meta.toLowerCase().includes(searchLower)) ||
        (item.weight && item.weight.toLowerCase().includes(searchLower)) ||
        (item.category && item.category.toLowerCase().includes(searchLower)) ||
        (item.type && item.type.toLowerCase().includes(searchLower)) ||
        (item.sizeType && item.sizeType.toLowerCase().includes(searchLower)) ||
        item.amount.toString().includes(searchQuery) ||
        item.quantity.toString().includes(searchQuery);

      const matchesWeight = !filterWeight || item.weight === filterWeight;
      const matchesCategory = !filterCategory || item.category === filterCategory;
      const matchesType = !filterType || item.type === filterType;
      const matchesSizeType = !filterSizeType || item.sizeType === filterSizeType;

      return matchesSearch && matchesWeight && matchesCategory && matchesType && matchesSizeType;
    });
  }, [items, searchQuery, filterWeight, filterCategory, filterType, filterSizeType]);

  const cartTotal = cart.reduce((sum, line) => sum + line.finalLineTotal, 0);

  const handleAddToCart = (item: Item) => {
    const qty = cartQuantities[item.id] || 1;
    if (qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const cartLine: CartLine = {
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      qty,
      unitPrice: item.amount,
      computedLineTotal: qty * item.amount,
      finalLineTotal: qty * item.amount,
    };

    addToCart(cartLine);
    setCartQuantities({ ...cartQuantities, [item.id]: 1 }); // Reset to 1 after adding
    setShowCartSidebar(true); // Open cart sidebar when item is added
    toast.success(`Added ${item.name} to cart`);
  };

  const handleDelete = (item: Item) => {
    if (confirm(`Delete ${item.name}?`)) {
      deleteItem(item.id);
      toast.success("Item deleted");
    }
  };

  const clearFilters = () => {
    setFilterWeight("");
    setFilterCategory("");
    setFilterType("");
    setFilterSizeType("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className={`flex-1 overflow-auto transition-all ${showCartSidebar ? 'lg:mr-80' : ''}`}>
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="mb-4 sm:mb-8 relative">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 sm:px-6 py-2 sm:py-4 pr-10 sm:pr-12 text-sm sm:text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Clear search"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              Add Item
            </button>

            <button
              onClick={() => exportItemsToExcel(filteredItems)}
              className="px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm"
              title="Export to Excel"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={() => exportItemsToPDF(filteredItems)}
              className="px-2 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm"
              title="Export to PDF"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </button>

            <select
              value={filterWeight}
              onChange={(e) => setFilterWeight(e.target.value as Weight | "")}
              className="px-2 sm:px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs sm:text-sm"
            >
              <option value="">All Weights</option>
              {["5gms", "10gms", "25gms", "50gms", "100gms", "250gms", "500gms", "1Kg", "2Kg", "5kg", "10kg", "25kg"].map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as Category | "")}
              className="px-2 sm:px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs sm:text-sm"
            >
              <option value="">All Categories</option>
              {["Personal Care Products", "Food", "Britania", "ITC", "Hindustan", "Household & Cleaning Supplies", "Drinks", "Cooking Oils & Sauces", "Spices & Seasonings", "Tea and Cofee", "Grains & Rice", "Pulses & Lentils", "Dairy", "General"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ItemType | "")}
              className="px-2 sm:px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
            </select>

            <select
              value={filterSizeType}
              onChange={(e) => setFilterSizeType(e.target.value as SizeType | "")}
              className="px-2 sm:px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs sm:text-sm"
            >
              <option value="">All Size Types</option>
              {["size", "individual", "case", "bag"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="px-2 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm"
            >
              Clear Filters
            </button>

            <button
              onClick={() => setShowCartSidebar(!showCartSidebar)}
              className="ml-auto px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
            >
              {showCartSidebar ? 'Hide' : 'Show'} Cart ({cart.length})
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Meta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item) => {
                  const qty = cartQuantities[item.id] || 1;
                  const lineAmount = qty * item.amount;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">₹{item.amount}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {[item.weight, item.category, item.type, item.sizeType].filter(Boolean).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => setCartQuantities({ ...cartQuantities, [item.id]: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="1"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">₹{lineAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center items-center">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Add to Cart"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredItems.map((item) => {
              const qty = cartQuantities[item.id] || 1;
              const lineAmount = qty * item.amount;
              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {[item.weight, item.category, item.type, item.sizeType].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Stock:</span>
                      <span className="ml-1 text-gray-900 dark:text-white font-medium">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="ml-1 text-gray-900 dark:text-white font-medium">₹{item.amount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setCartQuantities({ ...cartQuantities, [item.id]: parseInt(e.target.value) || 1 })}
                      className="w-14 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="1"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">×</span>
                    <span className="text-xs text-gray-900 dark:text-white">₹{item.amount}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">=</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">₹{lineAmount.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="ml-auto px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No items found
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCartSidebar && (
        <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full lg:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden flex flex-col z-50">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Cart</h2>
            <button
              onClick={() => setShowCartSidebar(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                Cart is empty
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {cart.map((line) => (
                  <div key={line.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">{line.name}</span>
                      <button
                        onClick={() => {
                          removeFromCart(line.id);
                          toast.success("Removed from cart");
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between items-center">
                        <span>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={line.qty}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1;
                            updateCartLine(line.id, { qty });
                          }}
                          className="w-14 sm:w-16 px-1 py-0.5 border rounded text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Unit Price:</span>
                        <span>₹{line.unitPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Computed:</span>
                        <span>₹{line.computedLineTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Final:</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.finalLineTotal}
                          onChange={(e) => {
                            const finalLineTotal = parseFloat(e.target.value) || 0;
                            updateCartLine(line.id, { finalLineTotal });
                          }}
                          className="w-16 sm:w-20 px-1 py-0.5 border rounded text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Total:</span>
                <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <Link
              href="/cart"
              className="block w-full px-4 py-2 sm:py-2.5 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              View Full Cart
            </Link>
          </div>
        </div>
      )}

      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
      />
    </div>
  );
}
