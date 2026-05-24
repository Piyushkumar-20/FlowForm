import Link from "next/link"

import { Button } from "~/components/ui/button"

export default function FormBuilderPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Form builder
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit form {params.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            This page is the builder shell for the selected form.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-xl border bg-background p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Builder canvas
            </p>
            <h2 className="text-lg font-semibold">Form structure</h2>
            <p className="text-sm text-muted-foreground">
              Load fields, edit question text, and arrange sections for form {" "}
              {params.id} here.
            </p>
          </div>
          <div className="mt-6 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Builder controls can be wired into this area next.
          </div>
        </section>

        <aside className="rounded-xl border bg-background p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Form details
            </p>
            <h2 className="text-lg font-semibold">Selected form</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="space-y-1">
              <dt className="text-muted-foreground">Form ID</dt>
              <dd className="font-medium break-all">{params.id}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">Ready for editing</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">Next step</dt>
              <dd className="font-medium">
                Wire this page to the form editor and field data.
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}