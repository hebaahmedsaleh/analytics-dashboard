import { useCallback, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

interface FiltersPanelProps {
  onFiltersChange: (filters: {
    coverage: [number, number];
    usage: 'all' | 'used' | 'unused';
    search: string;
  }) => void;
  totalAPIs: number;
  isLoading?: boolean;
  defaultFilters?: {
    coverage: [number, number];
    usage: 'all' | 'used' | 'unused';
    search: string;
  };
}

const DEFAULT_FILTERS = {
  coverage: [0, 100] as [number, number],
  usage: 'all' as const,
  search: ''
};

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  onFiltersChange,
  totalAPIs,
  isLoading = false,
  defaultFilters = DEFAULT_FILTERS
}) => {
  const [coverageRange, setCoverageRange] = useState<[number, number]>(defaultFilters.coverage);
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'unused'>(defaultFilters.usage);
  const [searchTerm, setSearchTerm] = useState(defaultFilters.search);

  // Debounce the filter changes to prevent too many updates
  const debouncedFiltersChange = useMemo(
    () =>
      debounce(
        (filters: { coverage: [number, number]; usage: 'all' | 'used' | 'unused'; search: string }) => {
          onFiltersChange(filters);
        },
        300
      ),
    [onFiltersChange]
  );

  // Update filters when any value changes
  const updateFilters = useCallback(
    (
      coverage: [number, number] = coverageRange,
      usage: 'all' | 'used' | 'unused' = usageFilter,
      search: string = searchTerm
    ) => {
      debouncedFiltersChange({ coverage, usage, search });
    },
    [coverageRange, usageFilter, searchTerm, debouncedFiltersChange]
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700">Filters</h3>
        <button
          onClick={() => {
            setCoverageRange(DEFAULT_FILTERS.coverage);
            setUsageFilter(DEFAULT_FILTERS.usage);
            setSearchTerm(DEFAULT_FILTERS.search);
            updateFilters(DEFAULT_FILTERS.coverage, DEFAULT_FILTERS.usage, DEFAULT_FILTERS.search);
          }}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v4a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Reset Filters
        </button>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Coverage Range Slider */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Coverage Range: {coverageRange[0]}% - {coverageRange[1]}%
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={coverageRange[0]}
              onChange={(e) => {
                const min = Math.min(Number(e.target.value), coverageRange[1] - 1);
                const newRange: [number, number] = [min, coverageRange[1]];
                setCoverageRange(newRange);
                updateFilters(newRange);
              }}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={coverageRange[1]}
              onChange={(e) => {
                const max = Math.max(Number(e.target.value), coverageRange[0] + 1);
                const newRange: [number, number] = [coverageRange[0], max];
                setCoverageRange(newRange);
                updateFilters(newRange);
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Usage Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Client Usage</label>
          <select
            value={usageFilter}
            onChange={(e) => {
              const value = e.target.value as 'all' | 'used' | 'unused';
              setUsageFilter(value);
              updateFilters(coverageRange, value);
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All APIs</option>
            <option value="used">Used APIs</option>
            <option value="unused">Unused APIs</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Search APIs ({totalAPIs} total)
          </label>
          <input
            type="text"
            placeholder="Search by API name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateFilters(coverageRange, usageFilter, e.target.value);
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};