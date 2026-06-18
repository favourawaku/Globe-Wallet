import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

export function PageHeader({
  title,
  back = "/",
  action,
}: {
  title: string
  back?: string
  action?: ReactNode
}) {
  return (
    <header
      data-testid="page-header"
      className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <Link
          href={back}
          data-testid="page-header-back"
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 data-testid="page-header-title" className="text-base font-semibold text-foreground">
          {title}
        </h1>
      </div>
      {action && <div data-testid="page-header-action">{action}</div>}
    </header>
  )
}
