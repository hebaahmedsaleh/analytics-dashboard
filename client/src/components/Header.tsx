import * as React from "react";
import { useDateRange } from "../context/date-range-context";

const Header: React.FC = () => {
  const { dateRange, setDateRange } = useDateRange();
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center bg-white shadow-sm border border-gray-100 rounded-2xl px-6 py-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
        API Coverage Analytics
      </h1>

      {/* Date Range Picker */}
      <div className="flex items-center gap-3 mt-4 sm:mt-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow transition">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="bg-transparent text-sm text-gray-700 focus:outline-none"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="bg-transparent text-sm text-gray-700 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
