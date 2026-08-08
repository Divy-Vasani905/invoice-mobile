import type { DashboardData } from '../types/dashboard.types';

export const MOCK_DASHBOARD_DATA: DashboardData = {
  business: {
    name: 'Apex Design Studio',
    currencyCode: 'USD',
    monthlyRevenue: 18450.0,
    weeklyRevenue: 4230.0,
    revenueGrowth: 12.8, // +12.8% growth
  },
  quickActions: [
    {
      id: 'new_invoice',
      label: 'New Invoice',
      icon: 'add',
      actionKey: 'new_invoice',
    },
  ],
  recentProducts: [],
  recentInvoices: [
    {
      id: 'inv-0025',
      invoiceNumber: 'INV-0025',
      customerName: 'Acme Corporation',
      amount: 1250.0,
      status: 'Paid',
      date: 'Aug 05, 2026',
    },
    {
      id: 'inv-0024',
      invoiceNumber: 'INV-0024',
      customerName: 'Wayne Enterprises',
      amount: 3400.0,
      status: 'Pending',
      date: 'Aug 04, 2026',
    },
    {
      id: 'inv-0023',
      invoiceNumber: 'INV-0023',
      customerName: 'Stark Industries',
      amount: 5600.5,
      status: 'Overdue',
      date: 'Jul 28, 2026',
    },
    {
      id: 'inv-0022',
      invoiceNumber: 'INV-0022',
      customerName: 'LexCorp',
      amount: 850.0,
      status: 'Draft',
      date: 'Aug 06, 2026',
    },
    {
      id: 'inv-0021',
      invoiceNumber: 'INV-0021',
      customerName: 'Oscorp Tech',
      amount: 2150.0,
      status: 'Paid',
      date: 'Jul 20, 2026',
    },
    {
      id: 'inv-0020',
      invoiceNumber: 'INV-0020',
      customerName: 'Daily Bugle',
      amount: 320.0,
      status: 'Pending',
      date: 'Aug 01, 2026',
    },
  ],
};
