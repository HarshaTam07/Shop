# Shop - Installation and Usage Instructions

## Overview

A clean POC for a small shop management web application built with Next.js, React, TypeScript, and Tailwind CSS. Features include item management, shopping cart, transactions tracking, and debt management with localStorage persistence.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State Management)
- **next-themes** (Dark/Light Mode)
- **react-hot-toast** (Notifications)

## Prerequisites

- Node.js 18.x or higher
- npm or yarn

## Installation

1. Clone or navigate to the project directory:
```bash
cd Shop
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Features

### 1. Items Management (`/items`)
- **Search**: Large search bar for finding items by name or keywords
- **Filters**: Filter by weight, category, type, and size type
- **Add Item**: Create new items with all metadata
- **Edit Item**: Update existing items
- **Delete Item**: Remove items (also removes from cart)
- **Add to Cart**: Select quantity and add items to cart

### 2. Shopping Cart (`/cart`)
- View all cart items
- Edit quantities
- Override final line totals (discounts)
- Remove items from cart
- Complete purchase with "Paid" button
- Automatic transaction creation

### 3. Transactions (`/transactions`)
- View all completed transactions
- Expand to see transaction details
- Shows date, item count, and total amount
- Displays individual line items

### 4. Debts Management (`/debts`)
- Add new debts with customer name and amount
- Track payment history
- Record partial or full payments
- Automatic status updates (OPEN/SETTLED)
- Prevents overpayment

### 5. Theme Toggle
- Switch between light and dark modes
- Preference saved automatically

## Data Persistence

All data is stored in browser localStorage:
- `shop_items`: Item inventory
- `shop_cart`: Current shopping cart
- `shop_transactions`: Transaction history
- `shop_debts`: Debt records

Data persists across page refreshes. Clear browser localStorage to reset all data.

## Mobile Support

The application is fully responsive and mobile-first:
- Touch-friendly buttons and inputs
- Horizontal scrolling for tables on small screens
- Collapsible navigation on mobile devices

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can specify a different port:
```bash
npm run dev -- -p 3001
```

### Clear Data
To reset all data, open browser DevTools (F12) and run:
```javascript
localStorage.clear()
```
Then refresh the page.

### Build Errors
If you encounter build errors, try:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## Development Notes

- This is a POC (Proof of Concept) - no backend or authentication
- Stock quantities are not reduced on purchase (as per requirements)
- All data is client-side only
- No server-side validation

## Project Structure

```
Shop/
├── app/                    # Next.js app directory
│   ├── items/             # Items page
│   ├── cart/              # Cart page
│   ├── transactions/      # Transactions page
│   ├── debts/             # Debts page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home (redirects to /items)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Header.tsx
│   ├── ItemFormModal.tsx
│   ├── DebtPaymentModal.tsx
│   ├── ThemeProvider.tsx
│   └── StoreInitializer.tsx
├── store/                 # State management
│   └── useStore.ts
├── types/                 # TypeScript types
│   └── index.ts
├── CHANGELOG.md          # Feature changelog
└── README-INSTRUCTIONS.md # This file
```

## Support

For issues or questions, please refer to the CHANGELOG.md for implemented features.
