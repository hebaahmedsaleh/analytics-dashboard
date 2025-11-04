import { useEffect, useMemo, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDateRange } from "../context/date-range-context";

interface APIData {
  name: string;
  coverage: string;
  usage: number;
  totalClients: number;
  apidoc: string;
}

const PAGE_SIZE = 50;

const VirtualizedDetailedTable: React.FC = () => {
  const { dateRange } = useDateRange();
  const [data, setData] = useState<APIData[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<"coverage" | "usage">("coverage");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  // fetch data for selected start date
  useEffect(() => {
    if (!dateRange.start) return;
    fetch(`/api/apis?date=${dateRange.start}`)
      .then((res) => res.json())
      .then((res) => setData(res.data || []))
      .catch((err) => console.error("Error fetching APIs:", err));
  }, [dateRange]);

  // filtering and sorting
  const filteredData = useMemo(() => {
    let result = data;
    if (filter) {
      result = result.filter((d) =>
        d.name.toLowerCase().includes(filter.toLowerCase())
      );
    }
    const parseNumeric = (v: any) => {
      if (v == null) return 0;
      if (typeof v === "string") return parseFloat(v.replace(/%/g, "")) || 0;
      return Number(v) || 0;
    };

    result = [...result].sort((a, b) => parseNumeric(b[sortKey]) - parseNumeric(a[sortKey]));
    return result;
  }, [data, filter, sortKey]);

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
      <div className="flex justify-between mb-4 items-center">
        <h3 className="text-lg font-semibold">Detailed API List</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search API..."
            className="border rounded px-2 py-1 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as "coverage" | "usage")}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="coverage">Sort by Coverage</option>
            <option value="usage">Sort by Usage</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-100 font-semibold px-4 py-2">
          <span>API Name</span>
          <span>Coverage</span>
          <span>Usage</span>
          <span>Total Clients</span>
        </div>

        <div ref={parentRef} className="overflow-auto" style={{ height: 500 }}>
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
                  className="absolute top-0 left-0 w-full border-b px-4 py-3 cursor-pointer hover:bg-gray-50"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
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