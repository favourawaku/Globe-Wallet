import {
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  ReceiptText,
  PiggyBank,
  CreditCard,
  Banknote,
  type LucideIcon,
} from "lucide-react"
import { transactions, formatMoney } from "@/lib/finance-data"
import type { Transaction } from "@/lib/types"
import { cn } from "@/lib/utils"

const categoryIcon: Record<string, LucideIcon> = {
  transfer: ArrowUpRight,
  airtime: Smartphone,
  bills: ReceiptText,
  savings: PiggyBank,
  card: CreditCard,
  deposit: Banknote,
  payment: ArrowUpRight,
  exchange: ArrowUpRight,
  withdrawal: ArrowUpRight,
}

export function TransactionList({ limit }: { limit?: number }) {
  const items = limit ? transactions.slice(0, limit) : transactions

  return (
    <ul className="divide-y divide-border" role="list" data-testid="transaction-list">
      {items.map((tx) => {
        const isIncoming = (tx.type as string) === "in" || (tx.type as string) === "receive" || (tx.type as string) === "deposit"
        const Icon = isIncoming ? ArrowDownLeft : (tx.category ? categoryIcon[tx.category] : ArrowUpRight) || ArrowUpRight
        
        return (
          <li
            key={tx.id}
            className="flex items-center gap-3 py-3"
            role="listitem"
            data-testid={`transaction-${tx.id}`}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                isIncoming ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
              )}
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{tx.name || "Transaction"}</p>
              <p className="truncate text-xs text-muted-foreground">{tx.detail || tx.address || ""}</p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-semibold",
                  isIncoming ? "text-primary" : "text-foreground",
                )}
              >
                {isIncoming ? "+" : "-"}
                {formatMoney(tx.amount, tx.currency || "USD")}
              </p>
              <p className="text-[11px] text-muted-foreground">{tx.date}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
