"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDate } from "@/lib/utils";

export interface TrendPoint {
  date: string;
  rate: number;
}

export function AttendanceTrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-400">
        Not enough data yet to chart a trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9e4d3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => formatDate(d, { weekday: "short" })}
          tick={{ fontSize: 12, fill: "#8a9585" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 12, fill: "#8a9585" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, "Attendance"]}
          labelFormatter={(d) => formatDate(d as string, { weekday: "long", month: "short", day: "numeric" })}
          contentStyle={{ borderRadius: 8, border: "1px solid #e9e4d3", fontSize: 12 }}
        />
        <Line type="monotone" dataKey="rate" stroke="#a3c02a" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
