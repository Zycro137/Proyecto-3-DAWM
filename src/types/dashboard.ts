export type DashboardFilters = {
  country: string;
  dateRange: 'all' | '2010' | '2011' | '2010-12' | '2011-01-03';
  product: string;
};

export type Kpi = {
  title: string;
  value: string;
  subtitle: string;
  icon: 'revenue' | 'units' | 'invoices' | 'customers';
  tone: 'green' | 'gold';
};

export type RankingItem = {
  label: string;
  value: number;
  formattedValue: string;
};

export type MonthlyRevenue = {
  month: string;
  value: number;
};

export type Transaction = {
  invoice: string;
  date: string;
  description: string;
  quantity: number;
  unitPrice: number;
  country: string;
};
