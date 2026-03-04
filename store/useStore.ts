import { create } from 'zustand';
import { Item, CartLine, Transaction, Debt, DebtHistory } from '@/types';
import { supabase } from '@/lib/supabase';

interface StoreState {
  items: Item[];
  cart: CartLine[];
  transactions: Transaction[];
  debts: Debt[];
  loading: boolean;
  addItem: (item: Item) => Promise<void>;
  updateItem: (id: string, item: Item) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addToCart: (line: CartLine) => Promise<void>;
  updateCartLine: (id: string, updates: Partial<CartLine>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  createTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addDebt: (debt: Debt) => Promise<void>;
  updateDebt: (id: string, debt: Debt) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  payDebt: (id: string, amount: number) => Promise<void>;
  loadData: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  items: [],
  cart: [],
  transactions: [],
  debts: [],
  loading: false,

  loadData: async () => {
    set({ loading: true });
    try {
      // Load items
      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      // Load cart
      const { data: cartData } = await supabase
        .from('cart_lines')
        .select('*')
        .order('created_at', { ascending: false });

      // Load transactions with their lines
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*, transaction_lines(*)')
        .order('created_at', { ascending: false });

      // Load debts with their history
      const { data: debtsData } = await supabase
        .from('debts')
        .select('*, debt_history(*)')
        .order('created_at', { ascending: false });

      // Transform data to match our types
      const items: Item[] = (itemsData || []).map(item => ({
        id: item.id,
        name: item.name,
        metaNames: item.meta_names || [],
        quantity: item.quantity,
        weight: item.weight,
        sizeType: item.size_type,
        category: item.category,
        type: item.type,
        amount: parseFloat(item.amount),
        purchasedAmount: item.purchased_amount ? parseFloat(item.purchased_amount) : undefined,
        createdAt: item.created_at,
      }));

      const cart: CartLine[] = (cartData || []).map(line => ({
        id: line.id,
        itemId: line.item_id,
        name: line.name,
        qty: line.qty,
        unitPrice: parseFloat(line.unit_price),
        computedLineTotal: parseFloat(line.computed_line_total),
        finalLineTotal: parseFloat(line.final_line_total),
      }));

      const transactions: Transaction[] = (transactionsData || []).map(txn => ({
        id: txn.id,
        name: txn.name,
        createdAt: txn.created_at,
        lines: (txn.transaction_lines || []).map((line: any) => ({
          id: line.id,
          itemId: line.item_id,
          name: line.name,
          qty: line.qty,
          unitPrice: parseFloat(line.unit_price),
          computedLineTotal: parseFloat(line.computed_line_total),
          finalLineTotal: parseFloat(line.final_line_total),
        })),
        computedTotal: parseFloat(txn.computed_total),
        finalTotal: parseFloat(txn.final_total),
        customAmount: txn.custom_amount ? parseFloat(txn.custom_amount) : undefined,
        debtPayment: txn.debt_payment_customer_name ? {
          customerName: txn.debt_payment_customer_name,
          amount: parseFloat(txn.debt_payment_amount),
        } : undefined,
        paidAmount: txn.paid_amount ? parseFloat(txn.paid_amount) : undefined,
        status: txn.status,
      }));

      const debts: Debt[] = (debtsData || []).map(debt => ({
        id: debt.id,
        customerName: debt.customer_name,
        date: debt.date,
        totalOwed: parseFloat(debt.total_owed),
        totalPaid: parseFloat(debt.total_paid),
        balance: parseFloat(debt.balance),
        history: (debt.debt_history || []).map((h: any) => ({
          id: h.id,
          date: h.date,
          amountPaid: parseFloat(h.amount_paid),
        })),
        status: debt.status,
      }));

      set({ items, cart, transactions, debts, loading: false });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    const { error } = await supabase.from('items').insert({
      id: item.id,
      name: item.name,
      meta_names: item.metaNames,
      quantity: item.quantity,
      weight: item.weight,
      size_type: item.sizeType,
      category: item.category,
      type: item.type,
      amount: item.amount,
      purchased_amount: item.purchasedAmount,
      created_at: item.createdAt,
    });

    if (!error) {
      set({ items: [...get().items, item] });
    }
  },

  updateItem: async (id, item) => {
    const { error } = await supabase
      .from('items')
      .update({
        name: item.name,
        meta_names: item.metaNames,
        quantity: item.quantity,
        weight: item.weight,
        size_type: item.sizeType,
        category: item.category,
        type: item.type,
        amount: item.amount,
        purchased_amount: item.purchasedAmount,
      })
      .eq('id', id);

    if (!error) {
      set({ items: get().items.map((i) => (i.id === id ? item : i)) });
    }
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('items').delete().eq('id', id);

    if (!error) {
      // Also remove from cart if exists
      const cartItem = get().cart.find(c => c.itemId === id);
      if (cartItem) {
        await supabase.from('cart_lines').delete().eq('item_id', id);
      }
      
      set({
        items: get().items.filter((i) => i.id !== id),
        cart: get().cart.filter((c) => c.itemId !== id),
      });
    }
  },

  addToCart: async (line) => {
    const cart = get().cart;
    const existingIndex = cart.findIndex((c) => c.itemId === line.itemId);

    if (existingIndex >= 0) {
      // Update existing cart line
      const existing = cart[existingIndex];
      const newQty = existing.qty + line.qty;
      const computedLineTotal = newQty * existing.unitPrice;

      await supabase
        .from('cart_lines')
        .update({
          qty: newQty,
          computed_line_total: computedLineTotal,
          final_line_total: computedLineTotal,
        })
        .eq('id', existing.id);

      const newCart = cart.map((c, i) => {
        if (i === existingIndex) {
          return {
            ...c,
            qty: newQty,
            computedLineTotal,
            finalLineTotal: computedLineTotal,
          };
        }
        return c;
      });
      set({ cart: newCart });
    } else {
      // Add new cart line
      await supabase.from('cart_lines').insert({
        id: line.id,
        item_id: line.itemId,
        name: line.name,
        qty: line.qty,
        unit_price: line.unitPrice,
        computed_line_total: line.computedLineTotal,
        final_line_total: line.finalLineTotal,
      });

      set({ cart: [...cart, line] });
    }
  },

  updateCartLine: async (id, updates) => {
    const cart = get().cart;
    const line = cart.find(c => c.id === id);
    if (!line) return;

    const updated = { ...line, ...updates };
    if (updates.qty !== undefined) {
      updated.computedLineTotal = updated.qty * updated.unitPrice;
      if (!updates.finalLineTotal) {
        updated.finalLineTotal = updated.computedLineTotal;
      }
    }

    await supabase
      .from('cart_lines')
      .update({
        qty: updated.qty,
        computed_line_total: updated.computedLineTotal,
        final_line_total: updated.finalLineTotal,
      })
      .eq('id', id);

    set({ cart: cart.map((c) => (c.id === id ? updated : c)) });
  },

  removeFromCart: async (id) => {
    await supabase.from('cart_lines').delete().eq('id', id);
    set({ cart: get().cart.filter((c) => c.id !== id) });
  },

  clearCart: async () => {
    await supabase.from('cart_lines').delete().neq('id', '');
    set({ cart: [] });
  },

  createTransaction: async (transaction) => {
    // Insert transaction
    await supabase.from('transactions').insert({
      id: transaction.id,
      name: transaction.name,
      created_at: transaction.createdAt,
      computed_total: transaction.computedTotal,
      final_total: transaction.finalTotal,
      custom_amount: transaction.customAmount,
      debt_payment_customer_name: transaction.debtPayment?.customerName,
      debt_payment_amount: transaction.debtPayment?.amount,
      paid_amount: transaction.paidAmount,
      status: transaction.status,
    });

    // Insert transaction lines
    const lines = transaction.lines.map(line => ({
      id: `${transaction.id}-${line.id}`,
      transaction_id: transaction.id,
      item_id: line.itemId,
      name: line.name,
      qty: line.qty,
      unit_price: line.unitPrice,
      computed_line_total: line.computedLineTotal,
      final_line_total: line.finalLineTotal,
    }));

    await supabase.from('transaction_lines').insert(lines);

    set({ transactions: [transaction, ...get().transactions] });
  },

  deleteTransaction: async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    set({ transactions: get().transactions.filter((t) => t.id !== id) });
  },

  addDebt: async (debt) => {
    await supabase.from('debts').insert({
      id: debt.id,
      customer_name: debt.customerName,
      date: debt.date,
      total_owed: debt.totalOwed,
      total_paid: debt.totalPaid,
      balance: debt.balance,
      status: debt.status,
    });

    set({ debts: [...get().debts, debt] });
  },

  updateDebt: async (id, debt) => {
    await supabase
      .from('debts')
      .update({
        customer_name: debt.customerName,
        date: debt.date,
        total_owed: debt.totalOwed,
        total_paid: debt.totalPaid,
        balance: debt.balance,
        status: debt.status,
      })
      .eq('id', id);

    set({ debts: get().debts.map((d) => (d.id === id ? debt : d)) });
  },

  deleteDebt: async (id) => {
    await supabase.from('debts').delete().eq('id', id);
    set({ debts: get().debts.filter((d) => d.id !== id) });
  },

  payDebt: async (id, amount) => {
    const debts = get().debts;
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const newTotalPaid = debt.totalPaid + amount;
    const newBalance = debt.totalOwed - newTotalPaid;
    const historyId = `payment-${Date.now()}`;
    const historyDate = new Date().toISOString();

    // Insert payment history
    await supabase.from('debt_history').insert({
      id: historyId,
      debt_id: id,
      date: historyDate,
      amount_paid: amount,
    });

    // Update debt
    await supabase
      .from('debts')
      .update({
        total_paid: newTotalPaid,
        balance: newBalance,
        status: newBalance <= 0 ? 'SETTLED' : 'OPEN',
      })
      .eq('id', id);

    const newHistory: DebtHistory = {
      id: historyId,
      date: historyDate,
      amountPaid: amount,
    };

    set({
      debts: debts.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            totalPaid: newTotalPaid,
            balance: newBalance,
            history: [...d.history, newHistory],
            status: newBalance <= 0 ? 'SETTLED' : 'OPEN',
          } as Debt;
        }
        return d;
      }),
    });
  },
}));
