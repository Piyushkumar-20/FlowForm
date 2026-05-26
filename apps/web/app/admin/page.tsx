"use client";

import * as React from "react";
import Link from "next/link";
import { UsersIcon, FileTextIcon, MessageSquareIcon, ShieldIcon } from "lucide-react";

import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useAdminStats, useAdminRecentData } from "~/hooks/api/admin";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-700/40 text-zinc-300 border-zinc-700/60",
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  unpublished: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-zinc-700/40 text-zinc-300 border-zinc-700/60",
  ADMIN: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

export default function AdminPage() {
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { recentUsers, recentForms, isLoading: recentLoading } = useAdminRecentData();

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
          <ShieldIcon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview and management</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Total Users"
          value={stats.totalUsers}
          loading={statsLoading}
          icon={<UsersIcon className="size-4" />}
          accent="violet"
        />
        <AdminStatCard
          label="Total Forms"
          value={stats.totalForms}
          loading={statsLoading}
          icon={<FileTextIcon className="size-4" />}
          accent="teal"
        />
        <AdminStatCard
          label="Total Submissions"
          value={stats.totalSubmissions}
          loading={statsLoading}
          icon={<MessageSquareIcon className="size-4" />}
          accent="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Users</h2>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-14 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : recentUsers.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                      No users yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Recent Forms */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Forms</h2>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : recentForms.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                      No forms yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentForms.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/forms/${f.id}`}
                          className="text-foreground transition-colors hover:text-primary"
                        >
                          {f.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[f.status]}`}>
                          {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {f.visibility}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(f.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <div className="mt-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

interface AdminStatCardProps {
  label: string;
  value: number;
  loading?: boolean;
  icon: React.ReactNode;
  accent: "violet" | "teal" | "emerald";
}

function AdminStatCard({ label, value, loading, icon, accent }: AdminStatCardProps) {
  const accentClass =
    accent === "violet"
      ? "text-violet-400 bg-violet-500/10"
      : accent === "teal"
        ? "text-teal-400 bg-teal-500/10"
        : "text-emerald-400 bg-emerald-500/10";

  const valueClass =
    accent === "violet"
      ? "text-violet-400"
      : accent === "teal"
        ? "text-teal-400"
        : "text-emerald-400";

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-5">
      <div className="flex items-center gap-2.5">
        <div className={`flex size-8 items-center justify-center rounded-lg ${accentClass}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className={`mt-3 text-3xl font-semibold tracking-tight ${valueClass}`}>
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );
}
