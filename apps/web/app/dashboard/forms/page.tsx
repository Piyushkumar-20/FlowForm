"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { CreateFormModal } from "~/components/create-form-modal"

export default function FormsPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Forms</h1>
          <p className="text-muted-foreground">Manage your forms here.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Create Form</Button>
      </div>
      <CreateFormModal open={open} onOpenChange={setOpen} />
    </div>
  )
}
