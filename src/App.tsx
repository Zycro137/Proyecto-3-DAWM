import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, CircularProgress } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { FilterPanel } from './components/FilterPanel';
import { Header } from './components/Header';
import { HorizontalRankingChart } from './components/HorizontalRankingChart';
import { KpiCard } from './components/KpiCard';
import { MonthlyRevenueChart } from './components/MonthlyRevenueChart';
import { TransactionsDetail } from './components/TransactionsDetail';
import { calculateDashboardData, loadSalesRecords } from './data/analytics';
import type { DashboardFilters, SaleRecord } from './types/dashboard';
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
  const [salesRecords, setSalesRecords] = useState<SaleRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    loadSalesRecords()
      .then((records) => {
        if (!isActive) return;
        setSalesRecords(records);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado al cargar las ventas desde Firebase.',
        );
      });

    return () => {
      isActive = false;
    };
  }, [retryToken]);

  const dashboardData = useMemo(
    () =>
      salesRecords === null
        ? null
        : calculateDashboardData(salesRecords, filters),
    [salesRecords, filters],
  );

  const activeFilters = [
    filters.country ? `País: ${filters.country}` : 'País: Todos',
    `Fechas: ${getDateRangeLabel(filters.dateRange)}`,
  ];

  const updateFilter = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters({ ...initialFilters });

  return (
    <div className="dashboard">
      <Header
        dateRange={dashboardData?.datasetDateRangeLabel ?? 'Cargando fechas…'}
      />

      <main className="dashboard-content">
        <FilterPanel
          countries={dashboardData?.countries ?? []}
          filters={filters}
          activeFilters={activeFilters}
          isMobile={isMobile}
          dialogOpen={filterDialogOpen}
          onDialogOpen={() => setFilterDialogOpen(true)}
          onDialogClose={() => setFilterDialogOpen(false)}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />

        {loadError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setLoadError(null);
                  setSalesRecords(null);
                  setRetryToken((current) => current + 1);
                }}
              >
                Reintentar
              </Button>
            }
          >
            {loadError}
          </Alert>
        ) : dashboardData === null ? (
          <div className="dashboard-loading" role="status">
            <CircularProgress size={24} />
            <span>Cargando registros de ventas desde Firebase…</span>
          </div>
        ) : (
          <>
            <section className="kpi-grid" aria-label="Indicadores clave">
              {dashboardData.kpis.map((kpi) => (
                <KpiCard key={kpi.title} {...kpi} />
              ))}
            </section>

            <section className="charts-grid" aria-label="Resumen de ventas">
              <MonthlyRevenueChart
                data={dashboardData.monthlyRevenue}
                partialDataNote={dashboardData.partialDataNote}
              />
              <HorizontalRankingChart
                title="Ingresos por país (sin Reino Unido)"
                subtitle="Top 10 · suma de TotalPrice por país"
                items={dashboardData.countryRankings}
                barColor="gold"
                footerNote={
                  filters.country === 'United Kingdom'
                    ? 'El Reino Unido se excluye de esta clasificación.'
                    : !filters.country && dashboardData.unitedKingdomShare > 0
                      ? `Reino Unido representa el ${dashboardData.unitedKingdomShare.toFixed(1)}% de los ingresos y se excluye para comparar el resto.`
                      : undefined
                }
                isMobile={isMobile}
              />
            </section>

            <section className="details-grid" aria-label="Detalle y productos">
              <HorizontalRankingChart
                title="Top 10 productos más vendidos"
                subtitle="Unidades vendidas por descripción"
                items={dashboardData.productRankings}
                barColor="green"
                isMobile={isMobile}
              />
              <TransactionsDetail
                key={`${filters.country}:${filters.dateRange}:${filters.product}:${isMobile}`}
                records={dashboardData.transactions}
                isMobile={isMobile}
              />
            </section>
          </>
        )}
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
      return 'Todo el periodo';
  }
}

export default App;