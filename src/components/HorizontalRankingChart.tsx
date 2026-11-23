import { useState } from 'react';
import { Button, Paper } from '@mui/material';
import type { RankingItem } from '../types/dashboard';

type HorizontalRankingChartProps = {
  title: string;
  subtitle: string;
  items: RankingItem[];
  barColor: 'gold' | 'green';
  footerNote?: string;
  isMobile: boolean;
};

export function HorizontalRankingChart({
  title,
  subtitle,
  items,
  barColor,
  footerNote,
  isMobile,
}: HorizontalRankingChartProps) {
  const [expanded, setExpanded] = useState(false);
  const maxValue = Math.max(0, ...items.map((item) => item.value));
  const visibleItems = isMobile && !expanded ? items.slice(0, 5) : items;

  return (
    <Paper component="section" className="panel" aria-label={title}>
      <div className="panel-heading">
        <div className="panel-title">{title}</div>
        <div className="panel-subtitle">{subtitle}</div>
      </div>
      {items.length > 0 ? (
        <div className={`ranking-list${isMobile && !expanded ? ' collapsed' : ''}`}>
          {visibleItems.map((item) => (
            <div className="ranking-row" key={item.label}>
              <span className="ranking-label" title={item.label}>
                {item.label}
              </span>
              <div
                className="ranking-track"
                role="meter"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={maxValue}
                aria-valuenow={item.value}
              >
                <div
                  className={`ranking-fill ${barColor}`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="ranking-value">{item.formattedValue}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-transactions" role="status">
          No hay datos para mostrar con estos filtros.
        </div>
      )}
      {footerNote ? <div className="ranking-note">{footerNote}</div> : null}
      {isMobile && items.length > 5 ? (
        <Button
          className="ranking-expand"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          {expanded ? 'Ver top 5 ↑' : 'Ver los 10 →'}
        </Button>
      ) : null}
    </Paper>
  );
}
