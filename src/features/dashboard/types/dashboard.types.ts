export interface BusinessInfo {
  name: string;
  monthlyRevenue: number;
  weeklyRevenue: number;
  revenueGrowth: number; // growth percentage (e.g. 14.2)
  currencyCode: string;
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: InvoiceStatus;
  date: string; // e.g. "Aug 06, 2026"
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string; // Ionicon icon name
  actionKey: 'new_invoice';
}

export interface DashboardData {
  business: BusinessInfo;
  recentInvoices: Invoice[];
  quickActions: QuickAction[];
}
