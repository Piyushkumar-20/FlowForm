import Link from "next/link"

import { FormsListTable } from "~/components/forms-list-table"
import { Button } from "~/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight">Your forms</h1>
          <p className="text-sm text-muted-foreground">
            Review every form you own and open one to edit it in the builder.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms">Create form</Link>
        </Button>
      </div>
      <FormsListTable />
    </div>
  )
}
