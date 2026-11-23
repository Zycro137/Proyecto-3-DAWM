import { useState } from 'react';
import { Pagination, Paper } from '@mui/material';
import type { Transaction } from '../types/dashboard';

type TransactionsDetailProps = {
  records: Transaction[];
  isMobile: boolean;
};

export function TransactionsDetail({
  records,
  isMobile,
}: TransactionsDetailProps) {
  const pageSize = isMobile ? 4 : 8;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));

  const currentRecords = records.slice((page - 1) * pageSize, page * pageSize);
  const visibleStart = records.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const visibleEnd = Math.min(page * pageSize, records.length);

  return (
    <Paper
      component="section"
      className="panel transactions-panel"
      aria-labelledby="transactions-title"
    >
      <div className="panel-heading">
        <div id="transactions-title" className="panel-title">
          Detalle de transacciones
        </div>
        <div className="panel-subtitle">Registros según los filtros activos</div>
      </div>

      {currentRecords.length === 0 ? (
        <div className="empty-transactions" role="status">
          No se encontraron transacciones con esos filtros.
        </div>
      ) : isMobile ? (
        <div className="transaction-cards">
          {currentRecords.map((record, index) => (
            <TransactionCard
              key={`${record.invoice}-${record.date}-${index}`}
              record={record}
            />
          ))}
        </div>
      ) : (
        <div className="transaction-table-wrap">
          <table className="transaction-table">
            <thead>
              <tr>
                <th scope="col">Factura</th>
                <th scope="col">Fecha</th>
                <th scope="col">Descripción</th>
                <th scope="col">Cant.</th>
                <th scope="col">Precio</th>
                <th scope="col">País</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record, index) => (
                <tr key={`${record.invoice}-${record.date}-${index}`}>
                  <td>{record.invoice}</td>
                  <td>{formatDate(record.date)}</td>
                  <td className="transaction-description" title={record.description}>
                    {record.description}
                  </td>
                  <td>{record.quantity}</td>
                  <td>{formatCurrency(record.unitPrice)}</td>
                  <td>{record.country}</td>
                  <td>{formatCurrency(record.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="transaction-pagination">
        <span>
          Mostrando {visibleStart}–{visibleEnd} de{' '}
          {records.length.toLocaleString('en-GB')} registros
        </span>
        {records.length > 0 ? (
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            size="small"
            siblingCount={isMobile ? 0 : 1}
            boundaryCount={1}
            getItemAriaLabel={(type, pageNumber, selected) => {
              if (type === 'page') {
                return `Ir a la página ${pageNumber}${selected ? ', actual' : ''}`;
              }
              if (type === 'first') return 'Ir a la primera página';
              if (type === 'last') return 'Ir a la última página';
              if (type === 'next') return 'Ir a la página siguiente';
              return 'Ir a la página anterior';
            }}
            aria-label="Paginación de transacciones"
          />
        ) : null}
      </div>
    </Paper>
  );
}

function TransactionCard({ record }: { record: Transaction }) {
  return (
    <article className="transaction-card">
      <div className="transaction-card-top">
        <div className="transaction-card-description">{record.description}</div>
        <div className="transaction-card-total">
          {formatCurrency(record.totalPrice)}
        </div>
      </div>
      <div className="transaction-card-meta">
        <span>Factura {record.invoice} · {formatDate(record.date)}</span>
      </div>
      <div className="transaction-card-meta">
        <span>
          {record.quantity} × {formatCurrency(record.unitPrice)} · {record.country}
        </span>
      </div>
    </article>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(value);
}

function formatDate(value: string) {
  const [date, time] = value.split('T');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time.slice(0, 5)}`;
}
