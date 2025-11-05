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
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-200 mb-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        <button
          onClick={() => {
            setCoverageRange(DEFAULT_FILTERS.coverage);
            setUsageFilter(DEFAULT_FILTERS.usage);
            setSearchTerm(DEFAULT_FILTERS.search);
            updateFilters(DEFAULT_FILTERS.coverage, DEFAULT_FILTERS.usage, DEFAULT_FILTERS.search);
          }}
          className="group relative px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          disabled={isLoading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v4a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span className="relative">Reset Filters</span>
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ${isLoading ? 'opacity-40 pointer-events-none blur-[1px]' : ''}`}>
        {/* Coverage Range Slider */}
        <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">Coverage Range</label>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                {coverageRange[0]}%
              </span>
              <span className="text-gray-400">-</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                {coverageRange[1]}%
              </span>
            </div>
          </div>
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
        <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <label className="block text-sm font-semibold text-gray-700">Client Usage</label>
          <div className="relative">
            <select
              value={usageFilter}
              onChange={(e) => {
                const value = e.target.value as 'all' | 'used' | 'unused';
                setUsageFilter(value);
                updateFilters(coverageRange, value);
              }}
              className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-200 text-sm font-medium text-gray-700 cursor-pointer appearance-none hover:border-gray-300"
            >
              <option value="all">All APIs</option>
              <option value="used">Used APIs</option>
              <option value="unused">Unused APIs</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {usageFilter === 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                Showing all
              </span>
            )}
            {usageFilter === 'used' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                ✓ Used only
              </span>
            )}
            {usageFilter === 'unused' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                ○ Unused only
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">Search APIs</label>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
              {totalAPIs} total
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by API name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                updateFilters(coverageRange, usageFilter, e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-200 text-sm placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  updateFilters(coverageRange, usageFilter, '');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Applying filters...</span>
        </div>
      )}
    </div>
  );
};