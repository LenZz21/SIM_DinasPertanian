"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: Array<{ month: number; total: number }>;
};

const monthLabel = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function MonthlyProductionChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const normalized = data.map((item) => ({
    ...item,
    name: monthLabel[Math.max(0, item.month - 1)] ?? `Bulan ${item.month}`,
  }));

  if (!mounted) {
    return <div className="h-[300px] w-full rounded-lg bg-[#f4f7f5]" />;
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={normalized}>
          <defs>
            <linearGradient id="colorHarvest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2f8f4e" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#2f8f4e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="total" stroke="#2f8f4e" fillOpacity={1} fill="url(#colorHarvest)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
