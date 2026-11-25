import { get, ref } from 'firebase/database';
import { database } from '../firebase';
import type { SaleRecord } from '../types/dashboard';

export function validateSaleRecord(value: unknown, index: number): SaleRecord {
  if (typeof value !== 'object' || value === null) {
    throw new Error(
      `El registro ${index + 1} en Firebase no es un objeto válido.`,
    );
  }

  const record = value as Record<string, unknown>;
  const normalizedCustomerId: number | null =
    record.CustomerID === undefined || record.CustomerID === null
      ? null
      : (record.CustomerID as number);

  const hasRequiredFields =
    'InvoiceNo' in record &&
    'StockCode' in record &&
    'Description' in record &&
    'Quantity' in record &&
    'InvoiceDate' in record &&
    'UnitPrice' in record &&
    'Country' in record &&
    'TotalPrice' in record;

  const valid =
    hasRequiredFields &&
    typeof record.InvoiceNo === 'string' &&
    typeof record.StockCode === 'string' &&
    typeof record.Description === 'string' &&
    typeof record.Quantity === 'number' &&
    Number.isFinite(record.Quantity) &&
    typeof record.InvoiceDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(record.InvoiceDate) &&
    typeof record.UnitPrice === 'number' &&
    Number.isFinite(record.UnitPrice) &&
    (normalizedCustomerId === null ||
      (typeof normalizedCustomerId === 'number' &&
        Number.isFinite(normalizedCustomerId))) &&
    typeof record.Country === 'string' &&
    typeof record.TotalPrice === 'number' &&
    Number.isFinite(record.TotalPrice);

  if (!valid) {
    throw new Error(
      `El registro ${index + 1} en Firebase tiene campos o valores inválidos.`,
    );
  }

  return {
    InvoiceNo: record.InvoiceNo as string,
    StockCode: record.StockCode as string,
    Description: record.Description as string,
    Quantity: record.Quantity as number,
    InvoiceDate: record.InvoiceDate as string,
    UnitPrice: record.UnitPrice as number,
    CustomerID: normalizedCustomerId,
    Country: record.Country as string,
    TotalPrice: record.TotalPrice as number,
  };
}

export function isSale(record: SaleRecord): boolean {
  return (
    !record.InvoiceNo.startsWith('C') &&
    record.Quantity > 0 &&
    record.UnitPrice > 0
  );
}

export async function fetchSalesFromRealtimeDatabase(
  path = '/',
): Promise<SaleRecord[]> {
  const dbRef = ref(database, path);
  const snapshot = await get(dbRef);

  if (!snapshot.exists()) {
    return [];
  }

  const payload: unknown = snapshot.val();
  const rawRecords = Array.isArray(payload)
    ? payload.filter((item) => item !== null && item !== undefined)
    : typeof payload === 'object' && payload !== null
      ? Object.values(payload).filter(
          (item) => item !== null && item !== undefined,
        )
      : null;

  if (!rawRecords) {
    throw new Error(
      'Los datos recuperados de Firebase Realtime Database no tienen un formato de colección válido.',
    );
  }

  return rawRecords
    .map((record, index) => validateSaleRecord(record, index))
    .filter(isSale);
}