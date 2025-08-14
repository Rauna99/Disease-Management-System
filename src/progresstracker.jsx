// ProgressTracker.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Mock API fetch function with filter
const fetchProgressData = async (range) => {
  // In a real app, you would call your backend API like:
  // const response = await fetch(`/api/progress?range=${range}`);
  // return await response.json();

  // Example data for demo purposes
  const allData = [
    { date: "2025-08-01", metric_value: 120 },
    { date: "2025-08-02", metric_value: 125 },
    { date: "2025-08-03", metric_value: 118 },
    { date: "2025-08-04", metric_value: 130 },
    { date: "2025-08-05", metric_value: 128 },
    { date: "2025-08-06", metric_value: 122 },
  ];

  if (range === "week") return allData.slice(-7);
  if (range === "month") return allData; // extend with more data for month
  if (range === "year") return allData; // extend with more data for year
  return allData;
};

// Mock AI analysis function
const analyzeProgress = (data) => {
  const last = data[data.length - 1].metric_value;
  const first = data[0].metric_value;
  if (last > first) {
    return "📈 Your health metric is trending upward. Consider consulting your doctor.";
  } else if (last < first) {
    return "📉 Your health metric is improving. Keep it up!";
  } else {
    return "➡️ Your health metric is stable. Maintain your routine.";
  }
};

const ProgressTracker = () => {
  const [progressData, setProgressData] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [range, setRange] = useState("week");

  const loadData = async (selectedRange) => {
    const data = await fetchProgressData(selectedRange);
    setProgressData(data);
    setAiInsight(analyzeProgress(data));
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-blue-500 text-lg mb-4">📊 Progress Tracking</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {["week", "month", "year"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded ${
              range === r
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={progressData}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="metric_value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      {/* AI Insight */}
      <div className="mt-4 p-2 bg-blue-50 rounded">{aiInsight}</div>
    </div>
  );
};

export default ProgressTracker;
