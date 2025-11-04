import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface FilterState {
  coverage: [number, number];
  usage: 'all' | 'used' | 'unused';
  search: string;
}

const DEFAULT_FILTERS: FilterState = {
  coverage: [0, 100],
  usage: 'all',
  search: ''
};

export function useFilterState(initialState = DEFAULT_FILTERS) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(getFiltersFromURL(searchParams, initialState));

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    // Coverage range
    newParams.set('coverage', filters.coverage.join(','));
    
    // Usage filter
    if (filters.usage !== 'all') {
      newParams.set('usage', filters.usage);
    } else {
      newParams.delete('usage');
    }
    
    // Search term
    if (filters.search) {
      newParams.set('search', filters.search);
    } else {
      newParams.delete('search');
    }

    setSearchParams(newParams, { replace: true });
  }, [filters, setSearchParams]);

  return [filters, setFilters] as const;
}

function getFiltersFromURL(params: URLSearchParams, defaultFilters: FilterState): FilterState {
  const coverage = params.get('coverage');
  const usage = params.get('usage');
  const search = params.get('search');

  return {
    coverage: coverage
      ? (coverage.split(',').map(Number) as [number, number])
      : defaultFilters.coverage,
    usage: (usage as FilterState['usage']) || defaultFilters.usage,
    search: search || defaultFilters.search
  };
}