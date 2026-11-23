import { Paper } from '@mui/material';
import type { MonthlyRevenue } from '../types/dashboard';

type MonthlyRevenueChartProps = {
  data: MonthlyRevenue[];
};

const chart = { width: 640, height: 240, left: 42, right: 12, top: 16, bottom: 30 };

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const maxValue = 1_200_000;
  const points = data.map((item, index) => ({
    ...item,
    x: chart.left + (index * plotWidth) / (data.length - 1),
    y: chart.top + plotHeight - (item.value / maxValue) * plotHeight,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const closedArea = `${chart.left},${chart.top + plotHeight} ${line} ${
    chart.width - chart.right
  },${chart.top + plotHeight}`;
  const peak = points.reduce((highest, point) =>
    point.value > highest.value ? point : highest,
  );
  const yTicks = [
    { value: 1_200_000, label: '£1.2M' },
    { value: 900_000, label: '£900K' },
    { value: 600_000, label: '£600K' },
    { value: 300_000, label: '£300K' },
    { value: 0, label: '£0' },
  ];

  return (
    <Paper component="section" className="panel" aria-labelledby="monthly-title">
      <div className="panel-heading">
        <div id="monthly-title" className="panel-title">
          Evolución mensual de los ingresos
        </div>
        <div className="panel-subtitle">
          Suma de TotalVenta por mes (InvoiceDate), en libras
        </div>
      </div>
      <svg
        className="monthly-chart"
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        role="img"
        aria-label="Gráfico de ingresos mensuales. El máximo se alcanza en noviembre con 1.16 millones de libras."
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2da978" stopOpacity=".25" />
            <stop offset="100%" stopColor="#2da978" stopOpacity=".015" />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => {
          const y = chart.top + plotHeight - (tick.value / maxValue) * plotHeight;
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
        <polyline
          className="chart-line"
          points={points.slice(0, -1).map((point) => `${point.x},${point.y}`).join(' ')}
        />
        <line
          className="chart-line-partial"
          x1={points[points.length - 2].x}
          y1={points[points.length - 2].y}
          x2={points[points.length - 1].x}
          y2={points[points.length - 1].y}
        />
        {points.map((point, index) => (
          <g key={point.month}>
            {index % 2 === 0 || index === points.length - 1 || point === peak ? (
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
              className={point === peak ? 'chart-point-max' : 'chart-point'}
              cx={point.x}
              cy={point.y}
              r={point === peak ? 4.5 : 3}
            />
          </g>
        ))}
        <g transform={`translate(${peak.x - 120} ${peak.y + 8})`}>
          <rect className="chart-callout" width="112" height="18" rx="5" />
          <text className="chart-callout-text" x="8" y="12">
            Máximo: Nov · £1.16M
          </text>
        </g>
        <g transform={`translate(${chart.width - 141} 10)`}>
          <rect className="chart-callout" width="128" height="18" rx="5" />
          <text className="chart-callout-text" x="7" y="12">
            * Dic 2011 parcial (hasta el 9)
          </text>
        </g>
      </svg>
      <div className="chart-note">
        Dic 2010 – Dic 2011 · Los datos de diciembre de 2011 terminan el 09/12/2011
      </div>
    </Paper>
  );
}
