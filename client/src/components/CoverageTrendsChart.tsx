import { useEffect, useState } from "react";
import { useDateRange } from "../context/date-range-context";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendPoint {
  date: string;
  avgCoverage: number;
}

const CoverageTrendsChart = () => {
  const { dateRange } = useDateRange();
  const [data, setData] = useState<TrendPoint[]>([]);

  const API_URL = import.meta.env.PROD 
  ? '/api'  // Production: uses Netlify redirects
  : 'https://rad-blini-e1ec7c.netlify.app/api';// Development: points to deployed backend
  
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    fetch(`${API_URL}/coverage-trends?start=${dateRange.start}&end=${dateRange.end}`)
      .then((res) => res.json())
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching coverage trends:", err));
  }, [dateRange]);

  return (
    <div style={{ width: "100%", height: 400 }} className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Coverage Trends</h3>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip />
          <Line type="monotone" dataKey="avgCoverage" stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CoverageTrendsChart;
