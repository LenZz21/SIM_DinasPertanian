"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#2f8f4e", "#7fbf3f", "#f0c85a", "#7a8c6d", "#4f6a56"];

type Props = {
  data: Array<{ crop_type: string; total: number }>;
};

export function CropPieChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[260px] w-full rounded-lg bg-[#f4f7f5]" />;
  }

  return (
    <div className="h-[260px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="crop_type" outerRadius={90} label>
            {data.map((entry, index) => (
              <Cell key={entry.crop_type} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
