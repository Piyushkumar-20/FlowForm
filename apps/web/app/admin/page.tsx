"use client";

import * as React from "react";
import Link from "next/link";
import {
  UsersIcon,
  FileTextIcon,
  MessageSquareIcon,
  ShieldIcon,
  MoreHorizontalIcon,
  StarIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  Trash2Icon,
  EyeOffIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  useAdminStats,
  useAdminRecentData,
  useAdminListAllForms,
  useAdminArchiveAnyForm,
  useAdminUnarchiveAnyForm,
  useAdminDeleteAnyForm,
  useAdminToggleFeaturedForm,
} from "~/hooks/api/admin";
import { useAdminListUserPlans } from "~/hooks/api/billing";
import { PlanBadge } from "~/app/dashboard/billing/page";

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

/* ── Moderation row ── */

type AdminForm = ReturnType<typeof useAdminListAllForms>["forms"][number];

function FormModerationRow({ form }: { form: AdminForm }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const { archiveAnyFormAsync, isPending: isArchiving } = useAdminArchiveAnyForm();
  const { unarchiveAnyFormAsync, isPending: isUnarchiving } = useAdminUnarchiveAnyForm();
  const { deleteAnyFormAsync, isPending: isDeleting } = useAdminDeleteAnyForm();
  const { toggleFeaturedFormAsync, isPending: isToggling } = useAdminToggleFeaturedForm();

  const handleArchive = async () => {
    try {
      await archiveAnyFormAsync({ formId: form.id });
      toast.success("Form archived and unpublished");
    } catch {
      toast.error("Could not archive form");
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveAnyFormAsync({ formId: form.id });
      toast.success("Form restored");
    } catch {
      toast.error("Could not restore form");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAnyFormAsync({ formId: form.id });
      toast.success("Form permanently deleted");
    } catch {
      toast.error("Could not delete form");
    }
  };

  const handleToggleFeatured = async () => {
    try {
      const result = await toggleFeaturedFormAsync({ formId: form.id });
      toast.success(result.isFeatured ? "Form featured on explore" : "Form unfeatured");
    } catch {
      toast.error("Could not update featured status");
    }
  };

  const isBusy = isArchiving || isUnarchiving || isDeleting || isToggling;

  return (
    <>
      <TableRow className={form.isArchived ? "opacity-50" : ""}>
        <TableCell className="font-medium">
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/dashboard/forms/${form.id}`}
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              {form.title ?? "Untitled"}
            </Link>
            {form.ownerEmail && (
              <span className="text-xs text-muted-foreground">{form.ownerEmail}</span>
            )}
          </div>
        </TableCell>

        <TableCell>
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[form.status]}`}>
            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
          </span>
        </TableCell>

        <TableCell className="hidden md:table-cell">
          <span className="text-xs text-muted-foreground capitalize">{form.visibility}</span>
        </TableCell>

        <TableCell className="hidden sm:table-cell">
          <div className="flex gap-1.5">
            {form.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">
                <StarIcon className="size-2.5" />
                Featured
              </span>
            )}
            {form.isArchived && (
              <span className="inline-flex items-center rounded-md border border-zinc-700/60 bg-zinc-700/30 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                Archived
              </span>
            )}
          </div>
        </TableCell>

        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
          {formatDate(form.createdAt)}
        </TableCell>

        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                disabled={isBusy}
              >
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => void handleToggleFeatured()} disabled={isToggling}>
                <StarIcon className="size-4" />
                {form.isFeatured ? "Remove from Featured" : "Feature on Explore"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {form.isArchived ? (
                <DropdownMenuItem onClick={() => void handleUnarchive()} disabled={isUnarchiving}>
                  <ArchiveRestoreIcon className="size-4" />
                  {isUnarchiving ? "Restoring…" : "Restore Form"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => void handleArchive()}
                  disabled={isArchiving}
                  className="text-muted-foreground"
                >
                  <ArchiveIcon className="size-4" />
                  {isArchiving ? "Archiving…" : "Archive & Unpublish"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDelete(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2Icon className="size-4" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>&ldquo;{form.title ?? "Untitled"}&rdquo;</strong> and all its submissions
              will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ── Main page ── */

export default function AdminPage() {
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { recentUsers, recentForms, isLoading: recentLoading } = useAdminRecentData();
  const { forms: allForms, isLoading: formsLoading } = useAdminListAllForms();
  const { users: usersWithPlans, isLoading: plansLoading } = useAdminListUserPlans();

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
          <ShieldIcon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview and moderation</p>
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

      {/* Recent Users + Recent Forms */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
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
                    <TableCell colSpan={4} className="h-20 text-center text-sm text-muted-foreground">
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
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : recentForms.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="h-20 text-center text-sm text-muted-foreground">
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

      {/* Form Moderation */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Form Moderation
            {!formsLoading && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {allForms.length} {allForms.length === 1 ? "form" : "forms"}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <EyeOffIcon className="size-3" />
            Archive removes forms from public view
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[30%]">Form / Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Visibility</TableHead>
                <TableHead className="hidden sm:table-cell">Flags</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formsLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-7 w-7 rounded-md" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : allForms.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    No forms on the platform yet
                  </TableCell>
                </TableRow>
              ) : (
                allForms.map((form) => (
                  <FormModerationRow key={form.id} form={form} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* User Subscriptions */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          User Subscriptions
          {!plansLoading && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {usersWithPlans.length} {usersWithPlans.length === 1 ? "user" : "users"}
            </span>
          )}
        </h2>
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden lg:table-cell">Plan Changed</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plansLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-14 rounded-md" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : usersWithPlans.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-20 text-center text-sm text-muted-foreground">
                    No users yet
                  </TableCell>
                </TableRow>
              ) : (
                usersWithPlans.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <PlanBadge plan={u.plan as "free" | "pro" | "enterprise"} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(u.planUpdatedAt)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="mt-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ── Stat card ── */

interface AdminStatCardProps {
  label: string;
  value: number;
  loading?: boolean;
  icon: React.ReactNode;
  accent: "violet" | "teal" | "emerald";
}

function AdminStatCard({ label, value, loading, icon, accent }: AdminStatCardProps) {
  const iconClass =
    accent === "violet" ? "text-violet-400 bg-violet-500/10"
    : accent === "teal" ? "text-teal-400 bg-teal-500/10"
    : "text-emerald-400 bg-emerald-500/10";

  const valueClass =
    accent === "violet" ? "text-violet-400"
    : accent === "teal" ? "text-teal-400"
    : "text-emerald-400";

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-5">
      <div className="flex items-center gap-2.5">
        <div className={`flex size-8 items-center justify-center rounded-lg ${iconClass}`}>
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
