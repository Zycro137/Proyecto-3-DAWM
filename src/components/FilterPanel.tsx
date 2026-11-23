import { useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { DashboardFilters } from '../types/dashboard';

type FilterPanelProps = {
  countries: string[];
  filters: DashboardFilters;
  activeFilters: string[];
  isMobile: boolean;
  dialogOpen: boolean;
  onDialogOpen: () => void;
  onDialogClose: () => void;
  onFilterChange: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => void;
  onReset: () => void;
};

const dateRanges: { value: DashboardFilters['dateRange']; label: string }[] = [
  { value: 'all', label: 'Todo el periodo disponible' },
  { value: '2010', label: 'Año 2010' },
  { value: '2011', label: 'Año 2011' },
  { value: '2010-12', label: 'Dic 2010' },
  { value: '2011-01-03', label: 'Ene – Mar 2011' },
];

export function FilterPanel({
  countries,
  filters,
  activeFilters,
  isMobile,
  dialogOpen,
  onDialogOpen,
  onDialogClose,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  const [draftFilters, setDraftFilters] = useState(filters);

  const handleDraftChange = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyDraft = () => {
    onFilterChange('country', draftFilters.country);
    onFilterChange('dateRange', draftFilters.dateRange);
    onFilterChange('product', draftFilters.product);
    onDialogClose();
  };

  const resetDraft = () => {
    setDraftFilters({ country: '', dateRange: 'all', product: '' });
  };

  const openDialog = () => {
    setDraftFilters(filters);
    onDialogOpen();
  };

  if (isMobile) {
    return (
      <>
        <div className="filter-mobile-row">
          <Button
            className="mobile-filter-button"
            onClick={openDialog}
            startIcon={<FilterIcon />}
          >
            Filtros
          </Button>
          <div className="mobile-filter-summary" aria-label="Filtros activos">
            <Chip className="filter-chip" label={activeFilters[0]} />
            <Chip className="filter-chip" label={activeFilters[1]} />
          </div>
        </div>
        <Dialog
          className="filter-dialog"
          fullWidth
          maxWidth="xs"
          open={dialogOpen}
          onClose={onDialogClose}
          aria-labelledby="filter-dialog-title"
        >
          <DialogContent className="filter-dialog-content">
            <div className="filter-dialog-heading">
              <div id="filter-dialog-title" className="filter-dialog-title">
                Filtros
              </div>
              <IconButton aria-label="Cerrar filtros" onClick={onDialogClose}>
                <CloseIcon />
              </IconButton>
            </div>
            <FilterFields
              countries={countries}
              filters={draftFilters}
              onChange={handleDraftChange}
            />
          </DialogContent>
          <DialogActions className="filter-dialog-actions">
            <Button variant="outlined" onClick={resetDraft}>
              Restablecer
            </Button>
            <Button
              className="apply-filter-button"
              variant="contained"
              onClick={applyDraft}
            >
              Aplicar filtros
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <div className="filter-bar" aria-label="Filtros de transacciones">
      <FilterFields
        countries={countries}
        filters={filters}
        onChange={onFilterChange}
      />
      <div className="active-filters">
        <span className="active-filters-label">Filtros activos:</span>
        {activeFilters.map((filter) => (
          <Chip className="filter-chip" key={filter} label={filter} />
        ))}
      </div>
      <Button
        className="reset-button"
        onClick={onReset}
        startIcon={<ResetIcon />}
      >
        Restablecer
      </Button>
    </div>
  );
}

type FilterFieldsProps = {
  countries: string[];
  filters: DashboardFilters;
  onChange: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => void;
};

function FilterFields({ countries, filters, onChange }: FilterFieldsProps) {
  const handleCountryChange = (event: SelectChangeEvent) => {
    onChange('country', event.target.value);
  };

  const handleDateChange = (event: SelectChangeEvent) => {
    onChange('dateRange', event.target.value as DashboardFilters['dateRange']);
  };

  return (
    <>
      <label className="filter-field">
        <span className="filter-label">País</span>
        <Select
          className="filter-select"
          size="small"
          value={filters.country}
          onChange={handleCountryChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Filtrar por país' }}
        >
          <MenuItem value="">Todos los países</MenuItem>
          {countries.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </Select>
      </label>
      <label className="filter-field">
        <span className="filter-label">Rango de fechas</span>
        <Select
          className="filter-select"
          size="small"
          value={filters.dateRange}
          onChange={handleDateChange}
          inputProps={{ 'aria-label': 'Filtrar por rango de fechas' }}
        >
          {dateRanges.map((range) => (
            <MenuItem key={range.value} value={range.value}>
              {range.label}
            </MenuItem>
          ))}
        </Select>
      </label>
      <label className="filter-field">
        <span className="filter-label">Producto</span>
        <TextField
          className="filter-search"
          size="small"
          value={filters.product}
          onChange={(event) => onChange('product', event.target.value)}
          placeholder="Buscar por descripción..."
          slotProps={{
            htmlInput: { 'aria-label': 'Buscar producto por descripción' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </label>
    </>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M7 12h10m-7 5h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="8" cy="7" r="2" fill="currentColor" />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" stroke="#829288" strokeWidth="2" />
      <path d="m16 16 4 4" stroke="#829288" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
