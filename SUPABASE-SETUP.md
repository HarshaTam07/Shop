# Supabase Setup Instructions

This application now uses Supabase as the database instead of localStorage.

## Setup Steps

### 1. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. The `.env.local` file should already have the correct values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://viixvjcdolytpdcbkpmu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

   If not, update them with your Supabase project credentials.

### 2. Execute the SQL Schema

1. Go to your Supabase project dashboard: https://viixvjcdolytpdcbkpmu.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste it into the SQL editor
6. Click **Run** to execute the script

This will create all the necessary tables:
- `items` - Store inventory items
- `cart_lines` - Shopping cart items
- `transactions` - Completed transactions
- `transaction_lines` - Line items for each transaction
- `debts` - Customer debts
- `debt_history` - Payment history for debts

### 2. Verify Tables Created

After running the script, go to the **Table Editor** in the left sidebar and verify that all 6 tables are created:
- items
- cart_lines
- transactions
- transaction_lines
- debts
- debt_history

### 3. Run the Application

```bash
npm install
npm run dev
```

The application will now use Supabase for all data storage and retrieval.

**Important:** Make sure `.env.local` exists with the correct Supabase credentials before running the app.

## What Changed

### Before (localStorage)
- Data stored in browser's localStorage
- Data lost when clearing browser data
- No sync across devices
- Limited to ~5-10MB storage

### After (Supabase)
- Data stored in PostgreSQL database
- Persistent across all devices
- Real-time sync capabilities
- Unlimited storage
- Better performance for large datasets

## Features

All existing features work exactly the same:
- ✅ Items management (Add, Edit, Delete, Search, Filter)
- ✅ Shopping cart with editable totals
- ✅ Transactions with partial payments
- ✅ Debt tracking with payment history
- ✅ Custom amounts and debt payments in cart
- ✅ Multi-select bulk delete
- ✅ Export to Excel and PDF
- ✅ Dark/Light mode
- ✅ Mobile responsive

## Database Structure

### Items Table
Stores all inventory items with metadata like weight, category, type, etc.

### Cart Lines Table
Stores current shopping cart items (cleared after checkout)

### Transactions Table
Stores completed transactions with totals and payment information

### Transaction Lines Table
Stores individual line items for each transaction (linked via transaction_id)

### Debts Table
Stores customer debt information with balance tracking

### Debt History Table
Stores payment history for each debt (linked via debt_id)

## Security

Row Level Security (RLS) is enabled on all tables with policies that allow all operations since there's no authentication in this POC. For production use, you should:
1. Add authentication
2. Update RLS policies to restrict access based on user roles
3. Add proper validation and constraints

## Troubleshooting

### If data doesn't load:
1. Check browser console for errors
2. Verify Supabase URL and anon key in `lib/supabase.ts`
3. Ensure SQL schema was executed successfully
4. Check Supabase project is active and not paused

### If operations fail:
1. Check RLS policies are created correctly
2. Verify network connection
3. Check Supabase project logs in dashboard

## Migration from localStorage

If you have existing data in localStorage, it will not be automatically migrated. The application will start fresh with Supabase. If you need to migrate existing data, you would need to:
1. Export data from localStorage
2. Transform it to match Supabase schema
3. Import via Supabase API or SQL inserts
