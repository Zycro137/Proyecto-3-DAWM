import { Paper } from '@mui/material';
import type { MonthlyRevenue } from '../types/dashboard';

type MonthlyRevenueChartProps = {
  data: MonthlyRevenue[];
  partialDataNote: string;
};

const chart = { width: 640, height: 240, left: 44, right: 12, top: 16, bottom: 30 };

export function MonthlyRevenueChart({
  data,
  partialDataNote,
}: MonthlyRevenueChartProps) {
  const maxValue = Math.max(0, ...data.map((item) => item.value));
  const axisMax = Math.max(300_000, Math.ceil(maxValue / 300_000) * 300_000);
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const points = data.map((item, index) => ({
    ...item,
    x:
      chart.left +
      (data.length < 2 ? plotWidth / 2 : (index * plotWidth) / (data.length - 1)),
    y: chart.top + plotHeight - (item.value / axisMax) * plotHeight,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const closedArea = `${chart.left},${chart.top + plotHeight} ${line} ${
    chart.width - chart.right
  },${chart.top + plotHeight}`;
  const peak = points.reduce<MonthlyRevenue | undefined>(
    (highest, point) =>
      highest === undefined || point.value > highest.value ? point : highest,
    undefined,
  );
  const peakPoint = peak ? points.find((point) => point.month === peak.month) : undefined;
  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const value = axisMax * (1 - index / 4);
    return { value, label: formatAxisValue(value) };
  });
  const calloutX = peakPoint
    ? Math.max(
        chart.left,
        Math.min(chart.width - chart.right - 112, peakPoint.x - 56),
      )
    : chart.left;
  const calloutY = peakPoint
    ? Math.max(chart.top + 2, peakPoint.y - 24)
    : chart.top;

  return (
    <Paper component="section" className="panel" aria-labelledby="monthly-title">
      <div className="panel-heading">
        <div id="monthly-title" className="panel-title">
          Evolución mensual de los ingresos
        </div>
        <div className="panel-subtitle">
          Suma de TotalPrice por mes (InvoiceDate), en libras
        </div>
      </div>
      {data.length === 0 ? (
        <div className="empty-transactions" role="status">
          No hay ingresos para mostrar con estos filtros.
        </div>
      ) : (
        <svg
          className="monthly-chart"
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label={`Ingresos mensuales. Máximo: ${peak?.month}, ${formatCurrency(peak?.value ?? 0)}.`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2da978" stopOpacity=".25" />
              <stop offset="100%" stopColor="#2da978" stopOpacity=".015" />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => {
            const y = chart.top + plotHeight - (tick.value / axisMax) * plotHeight;
            return (
              <g key={tick.label}>
                <line
                  className="chart-grid-line"
                  x1={chart.left}
                  x2={chart.width - chart.right}
                  y1={y}
                  y2={y}
                />
                <text className="chart-axis-label" x="3" y={y + 3}>
                  {tick.label}
                </text>
              </g>
            );
          })}
          <polygon className="chart-area" points={closedArea} />
          {points.length > 1 ? (
            <polyline
              className="chart-line"
              points={points
                .slice(0, -1)
                .map((point) => `${point.x},${point.y}`)
                .join(' ')}
            />
          ) : null}
          {points.length > 1 ? (
            <line
              className="chart-line-partial"
              x1={points[points.length - 2].x}
              y1={points[points.length - 2].y}
              x2={points[points.length - 1].x}
              y2={points[points.length - 1].y}
            />
          ) : null}
          {points.map((point, index) => (
            <g key={point.month}>
              {index % 2 === 0 || index === points.length - 1 ? (
                <text
                  className="chart-month-label"
                  textAnchor="middle"
                  x={point.x}
                  y={chart.height - 8}
                >
                  {point.month}
                </text>
              ) : null}
              <circle
                className={
                  point.month === peakPoint?.month ? 'chart-point-max' : 'chart-point'
                }
                cx={point.x}
                cy={point.y}
                r={point.month === peakPoint?.month ? 4.5 : 3}
              />
            </g>
          ))}
          {peak ? (
            <g transform={`translate(${calloutX} ${calloutY})`}>
              <rect className="chart-callout" width="112" height="18" rx="5" />
              <text className="chart-callout-text" x="7" y="12">
                Máximo: {peak.month} · {formatCompactCurrency(peak.value)}
              </text>
            </g>
          ) : null}
        </svg>
      )}
      <div className="chart-note">{partialDataNote}</div>
    </Paper>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return `£${new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function formatAxisValue(value: number) {
  if (value === 0) return '£0';
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(value % 1_000_000 ? 2 : 1)}M`;
  }
  return `£${Math.round(value / 1_000)}K`;
}
