import { Paper } from '@mui/material';
import type { Kpi } from '../types/dashboard';

type KpiCardProps = Kpi;

export function KpiCard({ title, value, subtitle, icon, tone }: KpiCardProps) {
  return (
    <Paper component="article" className="kpi-card">
      <div className="kpi-card-top">
        <div className="kpi-title">{title}</div>
        <div className={`kpi-icon ${tone}`} aria-hidden="true">
          <KpiIcon name={icon} />
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtitle">{subtitle}</div>
    </Paper>
  );
}

function KpiIcon({ name }: { name: Kpi['icon'] }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
  };

  switch (name) {
    case 'revenue':
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" {...common}>
          <path d="M12 3v18m4-14H9.8a2.8 2.8 0 0 0 0 5.6h4.4a2.8 2.8 0 0 1 0 5.6H7" />
        </svg>
      );
    case 'units':
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v8.5" />
        </svg>
      );
    case 'invoices':
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" {...common}>
          <path d="M6 3h12v18l-2.5-1.6L13 21l-3-1.6L6 21V3Z" />
          <path d="M9 8h6m-6 4h6m-6 4h3" />
        </svg>
      );
    case 'customers':
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20m2-13a3 3 0 0 1 0 6m2 2a4.5 4.5 0 0 1 2 3.8V20" />
        </svg>
      );
  }
}
