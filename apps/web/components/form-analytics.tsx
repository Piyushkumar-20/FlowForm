"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Field } from "~/hooks/api/form";
import type { RouterOutputs } from "@repo/trpc/client";

type Submission = RouterOutputs["form"]["getFormSubmissions"][number];

/* ── helpers ── */

function getRawValues(fieldId: string, submissions: Submission[]) {
  return submissions
    .flatMap((s) => s.values.filter((v) => v.formFieldId === fieldId))
    .map((v) => v.value);
}

function countAnswered(fieldId: string, submissions: Submission[]) {
  return getRawValues(fieldId, submissions).filter(
    (v) => v !== null && v !== "" && v !== false,
  ).length;
}

const TEAL = "#1d9e75";
const PIE_COLORS = [TEAL, "#0b5c47", "#3ab893", "#07433a", "#62d4ae"];

/* ── submission trend ── */
function buildTrend(submissions: Submission[]) {
  const map = new Map<string, { date: string; count: number; ts: number }>();
  for (const s of submissions) {
    const d = new Date(s.createdAt);
    const ts = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const key = d.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    });
    const existing = map.get(key);
    if (existing) {
      existing.count++;
    } else {
      map.set(key, { date: key, count: 1, ts });
    }
  }
  return [...map.values()].sort((a, b) => a.ts - b.ts);
}

/* ── per-field stats ── */
function buildBarData(
  fieldId: string,
  submissions: Submission[],
  options: string[],
  isCheckbox: boolean,
): { name: string; count: number }[] {
  const counts = new Map<string, number>(options.map((o) => [o, 0]));
  for (const raw of getRawValues(fieldId, submissions)) {
    if (raw === null || raw === "") continue;
    if (isCheckbox) {
      try {
        const arr = JSON.parse(String(raw)) as string[];
        for (const opt of arr)
          counts.set(opt, (counts.get(opt) ?? 0) + 1);
      } catch {
        counts.set(String(raw), (counts.get(String(raw)) ?? 0) + 1);
      }
    } else {
      counts.set(String(raw), (counts.get(String(raw)) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

function buildRatingData(
  fieldId: string,
  submissions: Submission[],
): { name: string; count: number }[] {
  const counts: Record<string, number> = {
    "1★": 0,
    "2★": 0,
    "3★": 0,
    "4★": 0,
    "5★": 0,
  };
  for (const raw of getRawValues(fieldId, submissions)) {
    const key = `${String(raw)}★`;
    if (key in counts) (counts as Record<string, number>)[key]!++;
  }
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

function buildYesNoData(
  fieldId: string,
  submissions: Submission[],
): { name: string; value: number }[] {
  let yes = 0;
  let no = 0;
  for (const raw of getRawValues(fieldId, submissions)) {
    if (raw === true || raw === "true" || raw === 1) yes++;
    else if (raw === false || raw === "false" || raw === 0) no++;
  }
  return [
    { name: "Yes", value: yes },
    { name: "No", value: no },
  ];
}

/* ── components ── */

const chartTooltipStyle = {
  backgroundColor: "#111",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#e5e5e5",
  fontSize: 12,
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-5">
      <p className="mb-4 text-sm font-medium text-foreground">{title}</p>
      {children}
    </div>
  );
}

interface FormAnalyticsProps {
  fields: Field[];
  submissions: Submission[];
}

export function FormAnalytics({ fields, submissions }: FormAnalyticsProps) {
  const trendData = React.useMemo(() => buildTrend(submissions), [submissions]);

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-base font-medium">No responses yet</p>
        <p className="text-sm text-muted-foreground">
          Analytics will appear here once submissions come in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card/60 p-4">
          <p className="text-xs text-muted-foreground">Total responses</p>
          <p className="mt-1 text-3xl font-semibold">{submissions.length}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-4">
          <p className="text-xs text-muted-foreground">First response</p>
          <p className="mt-1 text-sm font-medium">
            {submissions.length > 0
              ? new Date(
                  [...submissions].sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime(),
                  )[0]!.createdAt,
                ).toLocaleDateString("en", { dateStyle: "medium" })
              : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-4">
          <p className="text-xs text-muted-foreground">Latest response</p>
          <p className="mt-1 text-sm font-medium">
            {submissions.length > 0
              ? new Date(
                  [...submissions].sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )[0]!.createdAt,
                ).toLocaleDateString("en", { dateStyle: "medium" })
              : "—"}
          </p>
        </div>
      </div>

      {/* Submission trend */}
      {trendData.length > 1 && (
        <ChartCard title="Submission trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={TEAL}
                strokeWidth={2}
                dot={{ fill: TEAL, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Per-field charts */}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const answered = countAnswered(field.id, submissions);

          if (field.type === "YES_NO") {
            const data = buildYesNoData(field.id, submissions);
            const total = data.reduce((s, d) => s + d.value, 0);
            if (total === 0) return null;
            return (
              <ChartCard key={field.id} title={field.label}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
                  {data.map((d, i) => (
                    <span key={d.name} className="flex items-center gap-1">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{
                          background:
                            PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      {d.name}: {d.value}
                    </span>
                  ))}
                </div>
              </ChartCard>
            );
          }

          if (field.type === "SELECT" || field.type === "CHECKBOX") {
            const data = buildBarData(
              field.id,
              submissions,
              field.options ?? [],
              field.type === "CHECKBOX",
            );
            if (data.every((d) => d.count === 0)) return null;
            return (
              <ChartCard key={field.id} title={field.label}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12 }}>
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill={TEAL} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            );
          }

          if (field.type === "RATING") {
            const data = buildRatingData(field.id, submissions);
            if (data.every((d) => d.count === 0)) return null;
            const ratingValues = getRawValues(field.id, submissions)
              .filter((v) => v !== null && v !== "")
              .map((v) => Number(v))
              .filter((n) => !isNaN(n));
            const avg =
              ratingValues.length > 0
                ? (
                    ratingValues.reduce((s, v) => s + v, 0) /
                    ratingValues.length
                  ).toFixed(1)
                : "—";
            return (
              <ChartCard key={field.id} title={`${field.label} · avg ${avg}★`}>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={data}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={20}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill={TEAL} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            );
          }

          /* TEXT / NUMBER / EMAIL / PASSWORD / DATE — simple stat */
          return (
            <div
              key={field.id}
              className="rounded-xl border border-border/70 bg-card/60 p-4"
            >
              <p className="text-sm font-medium">{field.label}</p>
              <p className="mt-3 text-3xl font-semibold">{answered}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                of {submissions.length}{" "}
                {submissions.length === 1 ? "response" : "responses"} answered
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
