-- Shop Application Database Schema for Supabase
-- Execute this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items Table
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meta_names TEXT[] DEFAULT '{}',
  quantity INTEGER NOT NULL,
  weight TEXT,
  size_type TEXT,
  category TEXT,
  type TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  purchased_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cart Lines Table
CREATE TABLE IF NOT EXISTS cart_lines (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  computed_line_total DECIMAL(10, 2) NOT NULL,
  final_line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  computed_total DECIMAL(10, 2) NOT NULL,
  final_total DECIMAL(10, 2) NOT NULL,
  custom_amount DECIMAL(10, 2),
  debt_payment_customer_name TEXT,
  debt_payment_amount DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2),
  status TEXT DEFAULT 'PAID'
);

-- Transaction Lines Table (to store cart lines for each transaction)
CREATE TABLE IF NOT EXISTS transaction_lines (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  computed_line_total DECIMAL(10, 2) NOT NULL,
  final_line_total DECIMAL(10, 2) NOT NULL
);

-- Debts Table
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  total_owed DECIMAL(10, 2) NOT NULL,
  total_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  balance DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Debt History Table
CREATE TABLE IF NOT EXISTS debt_history (
  id TEXT PRIMARY KEY,
  debt_id TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_lines_item_id ON cart_lines(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_lines_transaction_id ON transaction_lines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_debts_customer_name ON debts(customer_name);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debt_history_debt_id ON debt_history(debt_id);

-- Enable Row Level Security (RLS) - Since there's no auth, we'll allow all operations
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since no authentication)
CREATE POLICY "Allow all operations on items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on cart_lines" ON cart_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transaction_lines" ON transaction_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on debts" ON debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on debt_history" ON debt_history FOR ALL USING (true) WITH CHECK (true);
