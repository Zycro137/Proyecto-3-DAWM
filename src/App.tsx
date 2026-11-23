import { useMemo, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { FilterPanel } from './components/FilterPanel';
import { Header } from './components/Header';
import { HorizontalRankingChart } from './components/HorizontalRankingChart';
import { KpiCard } from './components/KpiCard';
import { MonthlyRevenueChart } from './components/MonthlyRevenueChart';
import { TransactionsDetail } from './components/TransactionsDetail';
import {
  countries,
  countryRankings,
  kpis,
  monthlyRevenue,
  productRankings,
  transactions,
} from './data/dashboardData';
import type { DashboardFilters } from './types/dashboard';
import './App.css';

const initialFilters: DashboardFilters = {
  country: '',
  dateRange: 'all',
  product: '',
};

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    const query = filters.product.trim().toLocaleLowerCase();

    return transactions.filter((transaction) => {
      const countryMatches =
        !filters.country || transaction.country === filters.country;
      const productMatches =
        !query || transaction.description.toLocaleLowerCase().includes(query);
      const year = transaction.date.slice(0, 4);
      const month = transaction.date.slice(5, 7);
      const dateMatches =
        filters.dateRange === 'all' ||
        (filters.dateRange === '2010' && year === '2010') ||
        (filters.dateRange === '2011' && year === '2011') ||
        (filters.dateRange === '2010-12' && transaction.date.startsWith('2010-12')) ||
        (filters.dateRange === '2011-01-03' &&
          year === '2011' &&
          Number(month) >= 1 &&
          Number(month) <= 3);

      return countryMatches && productMatches && dateMatches;
    });
  }, [filters]);

  const activeFilters = [
    filters.country ? `País: ${filters.country}` : 'País: Todos',
    filters.dateRange === 'all'
      ? 'Fechas: Dic 2010 – Dic 2011'
      : `Fechas: ${getDateRangeLabel(filters.dateRange)}`,
  ];

  const updateFilter = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(initialFilters);

  return (
    <div className="dashboard">
      <Header />

      <main className="dashboard-content">
        <FilterPanel
          countries={countries}
          filters={filters}
          activeFilters={activeFilters}
          isMobile={isMobile}
          dialogOpen={filterDialogOpen}
          onDialogOpen={() => setFilterDialogOpen(true)}
          onDialogClose={() => setFilterDialogOpen(false)}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />

        <section className="kpi-grid" aria-label="Indicadores clave">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </section>

        <section className="charts-grid" aria-label="Resumen de ventas">
          <MonthlyRevenueChart data={monthlyRevenue} />
          <HorizontalRankingChart
            title="Ingresos por país (sin Reino Unido)"
            subtitle="Top 10 · suma de TotalVenta por Country"
            items={countryRankings}
            barColor="gold"
            footerNote="Reino Unido concentra el 82% de los ingresos (£7.3 M) y se excluye para poder comparar el resto."
            isMobile={isMobile}
          />
        </section>

        <section className="details-grid" aria-label="Detalle y productos">
          <HorizontalRankingChart
            title="Top 10 productos más vendidos"
            subtitle="Unidades vendidas (Quantity) por Description"
            items={productRankings}
            barColor="green"
            isMobile={isMobile}
          />
          <TransactionsDetail
            key={`${filters.country}:${filters.dateRange}:${filters.product}:${isMobile}`}
            records={filteredTransactions}
            isMobile={isMobile}
          />
        </section>
      </main>
    </div>
  );
}

function getDateRangeLabel(value: DashboardFilters['dateRange']) {
  switch (value) {
    case '2010':
      return 'Año 2010';
    case '2011':
      return 'Año 2011';
    case '2010-12':
      return 'Dic 2010';
    case '2011-01-03':
      return 'Ene – Mar 2011';
    default:
      return 'Dic 2010 – Dic 2011';
  }
}

export default App;
