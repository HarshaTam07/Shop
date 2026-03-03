import { create } from 'zustand';
import { Item, CartLine, Transaction, Debt } from '@/types';

interface StoreState {
  items: Item[];
  cart: CartLine[];
  transactions: Transaction[];
  debts: Debt[];
  addItem: (item: Item) => void;
  updateItem: (id: string, item: Item) => void;
  deleteItem: (id: string) => void;
  addToCart: (line: CartLine) => void;
  updateCartLine: (id: string, updates: Partial<CartLine>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  createTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Debt) => void;
  deleteDebt: (id: string) => void;
  payDebt: (id: string, amount: number) => void;
  loadFromStorage: () => void;
}

const STORAGE_KEYS = {
  items: 'shop_items',
  cart: 'shop_cart',
  transactions: 'shop_transactions',
  debts: 'shop_debts',
};

const safeJSONParse = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const useStore = create<StoreState>((set, get) => ({
  items: [],
  cart: [],
  transactions: [],
  debts: [],

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    set({
      items: safeJSONParse(STORAGE_KEYS.items, []),
      cart: safeJSONParse(STORAGE_KEYS.cart, []),
      transactions: safeJSONParse(STORAGE_KEYS.transactions, []),
      debts: safeJSONParse(STORAGE_KEYS.debts, []),
    });
  },

  addItem: (item) => {
    const items = [...get().items, item];
    set({ items });
    localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
  },

  updateItem: (id, item) => {
    const items = get().items.map((i) => (i.id === id ? item : i));
    set({ items });
    localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
  },

  deleteItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    const cart = get().cart.filter((c) => c.itemId !== id);
    set({ items, cart });
    localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  },

  addToCart: (line) => {
    const cart = get().cart;
    const existingIndex = cart.findIndex((c) => c.itemId === line.itemId);
    
    let newCart;
    if (existingIndex >= 0) {
      newCart = cart.map((c, i) => {
        if (i === existingIndex) {
          const newQty = c.qty + line.qty;
          const computedLineTotal = newQty * c.unitPrice;
          return {
            ...c,
            qty: newQty,
            computedLineTotal,
            finalLineTotal: computedLineTotal,
          };
        }
        return c;
      });
    } else {
      newCart = [...cart, line];
    }
    
    set({ cart: newCart });
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(newCart));
  },

  updateCartLine: (id, updates) => {
    const cart = get().cart.map((c) => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        if (updates.qty !== undefined) {
          updated.computedLineTotal = updated.qty * updated.unitPrice;
          if (!updates.finalLineTotal) {
            updated.finalLineTotal = updated.computedLineTotal;
          }
        }
        return updated;
      }
      return c;
    });
    set({ cart });
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  },

  removeFromCart: (id) => {
    const cart = get().cart.filter((c) => c.id !== id);
    set({ cart });
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  },

  clearCart: () => {
    set({ cart: [] });
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([]));
  },

  createTransaction: (transaction) => {
    const transactions = [transaction, ...get().transactions];
    set({ transactions });
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  },

  deleteTransaction: (id) => {
    const transactions = get().transactions.filter((t) => t.id !== id);
    set({ transactions });
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  },

  addDebt: (debt) => {
    const debts = [...get().debts, debt];
    set({ debts });
    localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(debts));
  },

  updateDebt: (id, debt) => {
    const debts = get().debts.map((d) => (d.id === id ? debt : d));
    set({ debts });
    localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(debts));
  },

  deleteDebt: (id) => {
    const debts = get().debts.filter((d) => d.id !== id);
    set({ debts });
    localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(debts));
  },

  payDebt: (id, amount) => {
    const debts = get().debts.map((d) => {
      if (d.id === id) {
        const newTotalPaid = d.totalPaid + amount;
        const newBalance = d.totalOwed - newTotalPaid;
        const newHistory = [
          ...d.history,
          {
            id: `payment-${Date.now()}`,
            date: new Date().toISOString(),
            amountPaid: amount,
          },
        ];
        return {
          ...d,
          totalPaid: newTotalPaid,
          balance: newBalance,
          history: newHistory,
          status: newBalance <= 0 ? "SETTLED" : "OPEN",
        } as Debt;
      }
      return d;
    });
    set({ debts });
    localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(debts));
  },
}));
