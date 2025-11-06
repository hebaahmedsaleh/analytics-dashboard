import { useEffect, useMemo, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDateRange } from "../context/date-range-context";
import { FiltersPanel } from "./FiltersPanel";
import { TableRowSkeleton } from "./Skeletons";
import { useFilterState } from "../hooks/useFilterState";

interface APIData {
  name: string;
  coverage: string;
  usage: number;
  totalClients: number;
  apidoc: string;
}

interface APIError {
  message: string;
  retryFn: () => void;
}

const PAGE_SIZE = 50;

const VirtualizedDetailedTable: React.FC = () => {
  const { dateRange } = useDateRange();
  const [data, setData] = useState<APIData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
  const [filters, setFilters] = useFilterState();
  const [sortKey, setSortKey] = useState<"coverage" | "usage">("coverage");
  const [page, setPage] = useState(1);

  const parentRef = useRef<HTMLDivElement>(null);

  // helper to parse coverage values like "85%" -> 85
  const parseNumeric = (v: any) => {
    if (v == null) return 0;
    if (typeof v === 'string') return parseFloat(v.replace(/%/g, '')) || 0;
    return Number(v) || 0;
  };

  const API_URL = import.meta.env.PROD 
  ? '/api'  // Production: uses Netlify redirects
  : 'https://rad-blini-e1ec7c.netlify.app/api';// Development: points to deployed backend


  // fetch data for selected start date
  useEffect(() => {
    if (!dateRange.start) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`${API_URL}/apis?date=${dateRange.start}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setData(data.data || []);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError({
          message: error.message,
          retryFn: fetchData
        });
        console.error("Error fetching APIs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // filtering and sorting
  const filteredData = useMemo(() => {
    let result = data;
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((d) =>
        d.name.toLowerCase().includes(searchLower)
      );
    }

    // Parse coverage and apply range filter
    const parseNumeric = (v: any) => {
      if (v == null) return 0;
      if (typeof v === "string") return parseFloat(v.replace(/%/g, "")) || 0;
      return Number(v) || 0;
    };

    // Apply coverage range filter
    result = result.filter((d) => {
      const coverage = parseNumeric(d.coverage);
      return coverage >= filters.coverage[0] && coverage <= filters.coverage[1];
    });

    // Apply usage filter
    if (filters.usage !== 'all') {
      result = result.filter((d) => {
        const isUsed = d.usage > 0;
        return filters.usage === 'used' ? isUsed : !isUsed;
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => parseNumeric(b[sortKey]) - parseNumeric(a[sortKey]));
    return result;
  }, [data, filters, sortKey]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginated = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // If the current page is out of range after filtering, clamp it.
  useEffect(() => {
    if (totalPages === 0) {
      setPage(1);
    } else if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);



  const rowVirtualizer = useVirtualizer({
    count: paginated.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  return (
    <div className="mt-8">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h3 className="text-xl font-bold text-gray-800">Detailed API List</h3>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                <span className="text-xs text-blue-600 font-medium">Loading...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span className="text-sm font-semibold text-gray-700">{filteredData.length}</span>
              <span className="text-sm text-gray-500">results</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Sort by</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as "coverage" | "usage")}
                className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <option value="coverage">Coverage</option>
                <option value="usage">Usage</option>
              </select>
            </div>
          </div>
        </div>
        
        <FiltersPanel
          onFiltersChange={setFilters}
          totalAPIs={data.length}
          isLoading={isLoading}
          defaultFilters={filters}
        />
      </div>

      <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b-2 border-gray-200">
          <div className="grid grid-cols-12 gap-4 items-center text-sm text-gray-600 font-semibold uppercase tracking-wide">
            <div className="col-span-6 md:col-span-7 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
              </svg>
              API Name
            </div>
            <div className="hidden md:block md:col-span-2">Coverage</div>
            <div className="col-span-3 md:col-span-2">Usage</div>
            <div className="hidden md:block md:col-span-1 text-right">Clients</div>
          </div>
        </div>

        <div ref={parentRef} className="overflow-auto relative bg-gray-50" style={{ height: 500 }}>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="absolute inset-0 bg-white flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50"></div>
                  <div className="relative text-red-500 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Something went wrong</h4>
                <p className="text-gray-600 max-w-md">{error.message}</p>
                <button
                  onClick={error.retryFn}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : null}
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const api = paginated[virtualRow.index];
              if (!api) return null;

              const coverageValue = parseNumeric(api.coverage);
              let coverageColor = 'bg-red-500';
              let coverageBg = 'bg-red-50';
              let coverageText = 'text-red-700';
              
              if (coverageValue >= 80) {
                coverageColor = 'bg-green-500';
                coverageBg = 'bg-green-50';
                coverageText = 'text-green-700';
              } else if (coverageValue >= 50) {
                coverageColor = 'bg-yellow-500';
                coverageBg = 'bg-yellow-50';
                coverageText = 'text-yellow-700';
              }
              
              const isUsed = (api.usage ?? 0) > 0;

              return (
                <div
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  className="absolute top-0 left-0 w-full group"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="h-full mx-2 my-1 px-6 py-4 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md hover:border-blue-300">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6 md:col-span-7 flex items-center gap-3">
                        <div className="font-semibold text-sm text-gray-800 truncate group-hover:text-blue-600 transition-colors" title={api.name}>
                          {api.name}
                        </div>
                      </div>

                      <div className="hidden md:block md:col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-3 h-3 rounded-full ${coverageColor} shadow-sm`} />
                            <div className={`absolute inset-0 w-3 h-3 rounded-full ${coverageColor} animate-ping opacity-20`} />
                          </div>
                          <div className={`text-sm font-semibold ${coverageText} px-2.5 py-1 ${coverageBg} rounded-md`}>
                            {coverageValue}%
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 md:col-span-2">
                        {isUsed ? (
                          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {api.usage}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                            <span className="w-2 h-2 bg-gray-400 rounded-full" />
                            0
                          </div>
                        )}
                      </div>

                      <div className="hidden md:block md:col-span-1 text-right">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md border border-gray-200">
                          {api.totalClients}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Page</span>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-bold rounded-md">{page}</span>
          <span className="text-gray-400">/</span>
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded-md">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button
            className="group relative px-5 py-2.5 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/0 via-gray-100 to-gray-100/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </span>
          </button>
          <button
            className="group relative px-5 py-2.5 bg-blue-500 hover:bg-blue-600 border-2 border-blue-500 hover:border-blue-600 rounded-lg font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg overflow-hidden"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative flex items-center gap-2">
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedDetailedTable;