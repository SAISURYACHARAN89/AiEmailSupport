import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./Analytics.css";

const Analytics = ({ stats }) => {
  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "Resolved", value: stats.resolved },
  ];

  const barData = [
    { name: "Total", value: stats.total },
    { name: "Urgent", value: stats.urgent },
    { name: "Pending", value: stats.pending },
  ];

  const COLORS = ["#FF8042", "#00C49F"];

  const sentimentData = [
    { name: "Positive", value: stats.sentiment.positive },
    { name: "Negative", value: stats.sentiment.negative },
    { name: "Neutral", value: stats.sentiment.neutral },
  ];

  const SENTIMENT_COLORS = ["#4caf50", "#f44336", "#9e9e9e"];

  return (
    <div className="analytics">
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Emails</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card urgent">
          <h3>Urgent</h3>
          <p>{stats.urgent}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </div>
      </div>
      <div className="charts">
        <PieChart width={300} height={300}>
          <Pie
            data={sentimentData}
            cx={150}
            cy={150}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {sentimentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
        <BarChart width={400} height={300} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default Analytics;
