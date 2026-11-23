import { AppBar, Box, Toolbar } from '@mui/material';

type HeaderProps = {
  dateRange: string;
};

export function Header({ dateRange }: HeaderProps) {
  return (
    <AppBar position="static" elevation={0} className="dashboard-header">
      <Toolbar className="dashboard-toolbar">
        <Box className="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation">
            <path
              d="M5 8h14l-1 12H6L5 8Zm3 0V6a4 4 0 0 1 8 0v2m-6 4a2 2 0 1 0 4 0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </Box>
        <div className="header-copy">
          <div className="header-title">Panel de ventas · Online Retail</div>
          <div className="header-subtitle">
            Tienda en línea del Reino Unido · {dateRange}
          </div>
        </div>
        <div className="source-badge">
          <span aria-hidden="true">▦</span>
          Fuente: UCI Machine Learning Repository
        </div>
      </Toolbar>
    </AppBar>
  );
}
