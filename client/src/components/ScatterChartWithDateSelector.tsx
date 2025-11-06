import { useEffect, useState } from "react";
import CoverageUsageScatter from "./CoverageUsageScatter";
import { useDateRange } from "../context/date-range-context";

const ScatterChartWithDateSelector = () => {
  const { dateRange } = useDateRange();
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(dateRange.start);

  const API_URL = import.meta.env.PROD 
  ? '/api'  // Production: uses Netlify redirects
  : 'https://rad-blini-e1ec7c.netlify.app/api';

  // Generate available dates from selected range
  useEffect(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const dates: string[] = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    setSelectedDate(dates[0]);
  }, [dateRange]);

  // Fetch scatter data when selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    fetch(`${API_URL}/coverage-usage?date=${selectedDate}`)
      .then((res) => res.json())
      .then((res) => setScatterData(res.data))
      .catch((err) => console.error("Error fetching scatter data:", err));
  }, [selectedDate]);

  return (
    <div className="p-6">
      <label className="mb-4 flex">
        <span className="inline-flex text-gray-700 m-1">Select Date within the selected Time Range in order to have analytics on each API:</span>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="m-2 block w-60 rounded-md border-gray-300 shadow-sm"
        >
          {Array.from(
            { length: (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / 86400000 + 1 },
            (_, i) => {
              const d = new Date(dateRange.start);
              d.setDate(d.getDate() + i);
              return d.toISOString().split("T")[0];
            }
          ).map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </label>

      <CoverageUsageScatter data={scatterData} />
    </div>
  );
};

export default ScatterChartWithDateSelector;
