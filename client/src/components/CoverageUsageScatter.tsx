import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScatterPoint {
  name: string;
  coverage: number;
  usage: number;
}

interface ScatterPlotProps {
  data: ScatterPoint[];
}

const CoverageUsageScatter: React.FC<ScatterPlotProps> = ({ data }) => {
  // Optional: custom tooltip
  const CustomTooltip = ({
    active,
    payload,

  }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as ScatterPoint;
      return (
        <div className="bg-white p-2 rounded shadow border">
          <p><strong>API:</strong> {point.name}</p>
          <p><strong>Coverage:</strong> {point.coverage.toFixed(1)}%</p>
          <p><strong>Calls:</strong> {point.usage.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="coverage"
            name="Coverage"
            unit="%"
            domain={[0, 100]}
          />
          <YAxis
            type="number"
            dataKey="usage"
            name="Usage"
            unit=""
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="APIs" data={data} fill="#4f46e5" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CoverageUsageScatter;
