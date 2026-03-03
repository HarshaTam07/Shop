export type Weight = "5gms" | "10gms" | "25gms" | "50gms" | "100gms" | "250gms" | "500gms" | "1Kg" | "2Kg" | "5kg" | "10kg" | "25kg";

export type SizeType = "size" | "individual" | "case" | "bag";

export type Category =
  | "Personal Care Products"
  | "Food"
  | "Britania"
  | "ITC"
  | "Hindustan"
  | "Household & Cleaning Supplies"
  | "Drinks"
  | "Cooking Oils & Sauces"
  | "Spices & Seasonings"
  | "Tea and Cofee"
  | "Grains & Rice"
  | "Pulses & Lentils"
  | "Dairy"
  | "General";

export type ItemType = "Retail" | "Wholesale";

export interface Item {
  id: string;
  name: string;
  metaNames: string[];
  quantity: number;
  weight?: Weight;
  sizeType?: SizeType;
  category?: Category;
  type?: ItemType;
  amount: number;
  purchasedAmount?: number;
  createdAt: string;
}

export interface CartLine {
  id: string;
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  computedLineTotal: number;
  finalLineTotal: number;
}

export interface Transaction {
  id: string;
  name?: string;
  createdAt: string;
  lines: CartLine[];
  computedTotal: number;
  finalTotal: number;
  customAmount?: number;
  debtPayment?: { customerName: string; amount: number };
  paidAmount?: number;
  status?: "PAID" | "PARTIAL";
}

export interface DebtHistory {
  id: string;
  date: string;
  amountPaid: number;
}

export interface Debt {
  id: string;
  customerName: string;
  date: string;
  totalOwed: number;
  totalPaid: number;
  balance: number;
  history: DebtHistory[];
  status: "OPEN" | "SETTLED";
}
