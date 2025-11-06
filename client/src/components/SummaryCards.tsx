import { useEffect, useState } from "react";

interface SummaryCardsProps {
  dateRange: { start: string; end: string };
}

interface SummaryData {
  totalAPIs: number;
  avgCoverage: number;
  totalCalls: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ dateRange }) => {
  const [summary, setSummary] = useState<SummaryData>({
    totalAPIs: 0,
    avgCoverage: 0,
    totalCalls: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const hasDateRange = !!(dateRange.start && dateRange.end);

  const API_URL = import.meta.env.PROD 
  ? '/api'  // Production: uses Netlify redirects
  : 'https://rad-blini-e1ec7c.netlify.app/api';// Development: points to deployed backend

useEffect(() => {
  const fetchSummary = async () => {
    if (!hasDateRange) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/summary?start=${dateRange.start}&end=${dateRange.end}`
      );
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchSummary();
}, [dateRange]);

  /** 🧭 Empty state */
  if (!hasDateRange) {
    return (
      <div className="mt-8 text-center text-gray-500">
        <p className="text-lg font-medium">
          Select a date range to view analytics
        </p>
      </div>
    );
  }

  /** ⏳ Loading state */
  if (isLoading) {
    return (
      <div className="mt-8 text-center text-gray-400 animate-pulse">
        Loading data...
      </div>
    );
  }

  /** 📊 Render summary cards */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
      <Card title="Total APIs Tracked" value={summary.totalAPIs} />
      <Card
        title="Average Coverage"
        value={`${summary.avgCoverage.toFixed(1)}%`}
      />
      <Card
        title="Total API Calls"
        value={summary.totalCalls.toLocaleString()}
      />
    </div>
  );
};

const Card = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-semibold text-blue-600 mt-2">{value}</p>
  </div>
);

export default SummaryCards;
