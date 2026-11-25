import type {
  DashboardData,
  DashboardFilters,
  Kpi,
  RankingItem,
  SaleRecord,
  Transaction,
} from '../types/dashboard';
import { fetchSalesFromRealtimeDatabase } from './firebaseSales';

const dateFormatter = new Intl.DateTimeFormat('es', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-GB');

export async function loadSalesRecords(): Promise<SaleRecord[]> {
  return fetchSalesFromRealtimeDatabase('/');
}

export function calculateDashboardData(
  records: SaleRecord[],
  filters: DashboardFilters,
): DashboardData {
  const productQuery = filters.product.trim().toLocaleLowerCase();
  const filteredRecords = records.filter((record) => {
    const countryMatches = !filters.country || record.Country === filters.country;
    const productMatches =
      !productQuery ||
      record.Description.toLocaleLowerCase().includes(productQuery);
    const dateMatches = matchesDateRange(record.InvoiceDate, filters.dateRange);
    return countryMatches && productMatches && dateMatches;
  });

  const invoiceNumbers = new Set<string>();
  const customerIds = new Set<number>();
  const revenueByMonth = new Map<string, number>();
  const revenueByCountry = new Map<string, number>();
  const quantityByProduct = new Map<string, number>();
  let totalRevenue = 0;
  let totalQuantity = 0;
  let unitedKingdomRevenue = 0;

  for (const record of filteredRecords) {
    invoiceNumbers.add(record.InvoiceNo);
    if (record.CustomerID !== null) customerIds.add(record.CustomerID);
    totalRevenue += record.TotalPrice;
    totalQuantity += record.Quantity;

    const monthKey = record.InvoiceDate.slice(0, 7);
    revenueByMonth.set(
      monthKey,
      (revenueByMonth.get(monthKey) ?? 0) + record.TotalPrice,
    );
    revenueByCountry.set(
      record.Country,
      (revenueByCountry.get(record.Country) ?? 0) + record.TotalPrice,
    );
    quantityByProduct.set(
      record.Description,
      (quantityByProduct.get(record.Description) ?? 0) + record.Quantity,
    );

    if (record.Country === 'United Kingdom') {
      unitedKingdomRevenue += record.TotalPrice;
    }
  }

  const monthlyRevenue = [...revenueByMonth.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([month, value]) => ({
      month: formatMonth(month),
      value: roundCurrency(value),
    }));

  const countryRankings = [...revenueByCountry.entries()]
    .filter(([country]) => country !== 'United Kingdom')
    .sort(([, first], [, second]) => second - first)
    .slice(0, 10)
    .map(([label, value]) => makeRanking(label, value, formatCurrency(value)));

  const productRankings = [...quantityByProduct.entries()]
    .sort(([, first], [, second]) => second - first)
    .slice(0, 10)
    .map(([label, value]) =>
      makeRanking(label, value, numberFormatter.format(value)),
    );

  const kpis: Kpi[] = [
    {
      title: 'Ingresos totales',
      value: formatCurrency(totalRevenue),
      subtitle: 'Suma de TotalPrice',
      icon: 'revenue',
      tone: 'green',
    },
    {
      title: 'Unidades vendidas',
      value: numberFormatter.format(totalQuantity),
      subtitle: 'Suma de Quantity',
      icon: 'units',
      tone: 'gold',
    },
    {
      title: 'Total de transacciones',
      value: numberFormatter.format(invoiceNumbers.size),
      subtitle: 'Facturas únicas (InvoiceNo)',
      icon: 'invoices',
      tone: 'green',
    },
    {
      title: 'Clientes únicos',
      value: numberFormatter.format(customerIds.size),
      subtitle: 'CustomerID distintos · excluye nulos',
      icon: 'customers',
      tone: 'gold',
    },
  ];

  const transactions: Transaction[] = filteredRecords.map((record) => ({
    invoice: record.InvoiceNo,
    date: record.InvoiceDate,
    description: record.Description,
    quantity: record.Quantity,
    unitPrice: record.UnitPrice,
    totalPrice: record.TotalPrice,
    country: record.Country,
  }));
  const datasetDateRangeLabel = getDataDateRange(records);
  const partialDataNote = getPartialDataNote(filteredRecords);

  return {
    countries: [...new Set(records.map((record) => record.Country))].sort((first, second) =>
      first.localeCompare(second),
    ),
    kpis,
    monthlyRevenue,
    countryRankings,
    productRankings,
    transactions,
    datasetDateRangeLabel,
    partialDataNote,
    unitedKingdomShare:
      totalRevenue > 0 ? (unitedKingdomRevenue / totalRevenue) * 100 : 0,
  };
}

function matchesDateRange(
  date: string,
  range: DashboardFilters['dateRange'],
) {
  switch (range) {
    case '2010':
      return date.startsWith('2010-');
    case '2011':
      return date.startsWith('2011-');
    case '2010-12':
      return date.startsWith('2010-12-');
    case '2011-01-03':
      return date >= '2011-01-01' && date < '2011-04-01';
    case 'all':
      return true;
  }
}

function makeRanking(label: string, value: number, formattedValue: string): RankingItem {
  return { label, value, formattedValue };
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const label = new Intl.DateTimeFormat('es', {
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  return `${label.charAt(0).toLocaleUpperCase()}${label.slice(1)} ${year}`;
}

function getDataDateRange(records: SaleRecord[]) {
  if (records.length === 0) return 'Sin registros';
  const first = records.reduce((earliest, record) =>
    record.InvoiceDate < earliest ? record.InvoiceDate : earliest,
  records[0].InvoiceDate);
  const last = records.reduce((latest, record) =>
    record.InvoiceDate > latest ? record.InvoiceDate : latest,
  records[0].InvoiceDate);
  return `${dateFormatter.format(dateOnly(first))} – ${dateFormatter.format(dateOnly(last))}`;
}

function getPartialDataNote(records: SaleRecord[]) {
  if (records.length === 0) return '';
  const last = records.reduce((latest, record) =>
    record.InvoiceDate > latest ? record.InvoiceDate : latest,
  records[0].InvoiceDate);
  const date = dateOnly(last);
  return `Datos disponibles hasta ${dateFormatter.format(date)}.`;
}

function dateOnly(dateTime: string) {
  return new Date(`${dateTime.slice(0, 10)}T00:00:00Z`);
}