import { useEffect, useMemo, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDateRange } from "../context/date-range-context";
import { FiltersPanel } from "./FiltersPanel";
import { TableRowSkeleton, FiltersSkeleton } from "./Skeletons";
import { useFilterState, FilterState } from "../hooks/useFilterState";

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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  // fetch data for selected start date
  useEffect(() => {
    if (!dateRange.start) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/apis?date=${dateRange.start}`);
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

  const toggleExpand = (name: string) => {
    const newSet = new Set(expanded);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setExpanded(newSet);
  };

  const rowVirtualizer = useVirtualizer({
    count: paginated.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  return (
    <div className="mt-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Detailed API List</h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            )}
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as "coverage" | "usage")}
            className="border rounded px-2 py-1 text-sm"
            disabled={isLoading}
          >
            <option value="coverage">Sort by Coverage</option>
            <option value="usage">Sort by Usage</option>
          </select>
        </div>
        
        <FiltersPanel
          onFiltersChange={setFilters}
          totalAPIs={data.length}
          isLoading={isLoading}
          defaultFilters={filters}
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-100 font-semibold px-4 py-2">
          <span>API Name</span>
          <span>Coverage</span>
          <span>Usage</span>
          <span>Total Clients</span>
        </div>

        <div ref={parentRef} className="overflow-auto relative" style={{ height: 500 }}>
          {isLoading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="absolute inset-0 bg-white flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-red-500 mb-2">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-700">{error.message}</p>
                <button
                  onClick={error.retryFn}
                  className="text-blue-500 hover:text-blue-700 font-medium"
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

              const coverageText =
                typeof api.coverage === "string" && api.coverage.includes("%")
                  ? api.coverage
                  : `${api.coverage}%`;

              return (
                <div
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  className="absolute top-0 left-0 w-full border-b px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all duration-200 ease-in-out"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  onClick={() => toggleExpand(api.name)}
                >
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <span className="font-medium">{api.name}</span>
                    <span>{coverageText}</span>
                    <span>{api.usage}</span>
                    <span>{api.totalClients}</span>
                  </div>
                  {expanded.has(api.name) && (
                    <div className="bg-gray-50 mt-2 p-2 rounded text-sm text-gray-700">
                      {api.apidoc || "No documentation available"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4 text-sm">
        <span>
          Page {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedDetailedTable;