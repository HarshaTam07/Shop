# Changelog

All notable changes to this project will be documented in this file.

## [Initial Release] - 2026-03-03

### Added
- **Project Setup**
  - Initialized Next.js 15 with App Router
  - Configured TypeScript and Tailwind CSS
  - Set up ESLint for code quality
  - Integrated next-themes for dark/light mode support
  - Added Zustand for state management
  - Implemented react-hot-toast for notifications

- **Data Models**
  - Created TypeScript types for Item, CartLine, Transaction, and Debt
  - Defined enums for Weight, SizeType, Category, and ItemType

- **State Management**
  - Implemented Zustand store with localStorage persistence
  - Added robust error handling for corrupt/missing localStorage data
  - Created actions for managing items, cart, transactions, and debts

- **Layout & Navigation**
  - Built responsive Header component with navigation
  - Implemented dark/light mode toggle
  - Added mobile-first responsive navigation
  - Created ThemeProvider for theme management
  - Added StoreInitializer for loading data on app start

- **Items Page**
  - Large prominent search bar with case-insensitive partial matching
  - Search by item name and metaNames keywords
  - Filters for weight, category, type, and sizeType
  - Clear filters button
  - Add Item button opening modal form
  - Items table showing name, stock, price, and metadata
  - Edit and Delete buttons for each item
  - Quantity input and computed line amount display
  - Add to Cart functionality with quantity validation
  - Combining same items in cart by default

- **Item Form Modal**
  - Add/Edit item functionality
  - Form fields: name, metaNames (comma-separated), quantity, weight, sizeType, category, type, selling price, purchased price
  - Validation for required fields
  - Responsive modal design

- **Cart Page**
  - Display cart lines with editable quantities
  - Show computed line total (qty × unit price)
  - Editable final line total (user can override)
  - Remove line button
  - Display both computed total and final total
  - Paid button to complete transaction
  - Clear cart after payment
  - Redirect to transactions page after payment

- **Transactions Page**
  - List all transactions (latest first)
  - Show transaction date, item count, and final total
  - Expandable/collapsible transaction details
  - Display individual line items with quantities and prices
  - Show both computed and final totals

- **Debts Page**
  - Form to add new debt (customer name, date, total owed)
  - List all debts with customer info and balances
  - Display status (OPEN/SETTLED)
  - Pay button for open debts
  - Payment history tracking
  - Automatic status update when balance reaches zero
  - Validation to prevent overpayment

- **Debt Payment Modal**
  - Input for amount paid
  - Display current balance
  - Validation against balance
  - Record payment in history
  - Update debt status automatically

- **UI/UX Features**
  - Clean Tailwind UI with cards and proper spacing
  - Mobile-first responsive design
  - Dark mode support throughout
  - Toast notifications for all actions
  - Accessible buttons and inputs
  - Smooth transitions and hover effects
  - Proper form validation and error messages


### Technical Implementation
- Successfully built and tested production build
- All TypeScript types properly configured
- PostCSS and Tailwind CSS properly integrated
- Zero build errors or warnings
- All pages statically generated for optimal performance

### Testing
- Verified successful production build
- Confirmed all routes are accessible
- Validated TypeScript compilation
- Ensured proper code splitting and optimization


## [Update] - 2026-03-03

### Enhanced Items Page
- **Icon-based Actions**: Replaced text buttons with intuitive icons
  - Edit icon (pencil)
  - Delete icon (trash)
  - Add to Cart icon (shopping cart)
- **Live Cart Sidebar**: Added real-time cart view on the right side
  - Shows cart items as they're added
  - Editable quantities and final totals directly in sidebar
  - Remove items with one click
  - Shows total amount and item count
  - Toggle visibility with Show/Hide Cart button
  - "View Full Cart" button to navigate to full cart page
- **Improved Table Layout**: Reorganized columns for better space utilization
  - Separate Qty and Amount columns
  - Compact action buttons with icons
  - Better mobile responsiveness
- **Dual Cart Experience**: Cart sidebar for quick view + full cart page for checkout


### Improved Quantity Management
- **Persistent Quantities**: Item quantities now persist after adding to cart
  - Allows easy re-adding of same items without re-entering quantity
  - Quantities only reset to zero after payment is completed
  - Makes it faster to add multiple batches of the same item
- **Payment Event System**: Automatic quantity reset across all pages when transaction is paid

## [Update] - 2026-03-03 (Reverted)

### Quantity Behavior Restored
- **Reset on Add**: Quantities now reset to 0 immediately after adding to cart
  - Simpler behavior without persistence issues
  - Clean slate for each new item addition


### Enhanced Debts Management
- **Delete Debt**: Added delete button with confirmation dialog
  - Delete icon (trash) next to each debt
  - Confirmation prompt to prevent accidental deletions
- **Improved UI**: 
  - Clean interface with inline add form
  - Delete action clearly visible for each debt


### Search Functionality Added
- **Debts Search**: Search debts by customer name, amount, or status
  - Real-time filtering as you type
  - Searches across all debt fields
- **Transactions Search**: Search transactions by amount or item name
  - Searches transaction total amount and item names
  - Shows "No results" message when no matches found
- **Transactions Date Filter**: Filter transactions by date range
  - From Date: Filter transactions from a specific date onwards
  - To Date: Filter transactions up to a specific date
  - Can use both together for a date range
  - Clear Filters button to reset all filters
  - Combines with search for powerful filtering


### Transaction Name Feature
- **Optional Transaction Name**: Added ability to name transactions before payment
  - Input field in cart page before "Paid" button
  - Optional field - can be left empty
  - Useful for customer names, bill numbers, or any reference
- **Display in Transactions**: Transaction name shown prominently in transaction list
  - Appears above date/time if provided
  - Makes transactions easier to identify
- **Search by Name**: Transaction name included in search functionality
  - Search transactions by name, amount, or item
  - Quick filtering by customer or reference

### UI Improvements
- **Compact Layout**: Reduced spacing and font sizes across all pages
  - Smaller headings, inputs, and cards
  - More content visible without scrolling
  - Better use of screen space


### Receipt View Feature
- **Thermal Printer Style Receipt**: Added receipt modal for transactions
  - View icon (eye) button on each transaction
  - Opens modal with 58mm/80mm thermal printer format
  - Professional bill layout like supermarket receipts
- **Receipt Details**:
  - Shop header with branding
  - Customer name (if provided)
  - Date and bill number
  - Itemized list with quantities and prices
  - Subtotal and final total
  - Discount shown if applied
  - Payment status
  - Thank you message
- **Print Functionality**: Print button to print the receipt
  - Optimized for thermal printers
  - Clean print layout
- **Mobile Friendly**: Easy to view on phone screens
  - Compact format
  - Scrollable content
  - Clear typography


### Transaction Delete Feature
- **Delete Transaction**: Added ability to delete transactions
  - Red trash icon button next to each transaction
  - Confirmation dialog before deletion
  - Shows transaction name in confirmation if available
  - Permanently removes transaction from history
