"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface DeptDatum {
  name: string;
  count: number;
}

const COLORS = ["#a3c02a", "#2f5c3f", "#c2570c", "#1f7a4d", "#64715f", "#d1372f", "#0c1f15"];

export function DepartmentDistributionChart({ data }: { data: DeptDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-400">
        No department data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9e4d3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#8a9585" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 12, fill: "#33402f" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [value, "Employees"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e9e4d3", fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
