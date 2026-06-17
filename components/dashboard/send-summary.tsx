"use client"

import { SendConfirmation } from "@/lib/types"
import { Separator } from "@/components/ui/separator"

interface SendSummaryProps {
  confirmation: SendConfirmation
}

export function SendSummary({ confirmation }: SendSummaryProps) {
  const { recipient, recipientLabel, amount, asset, memo, estimatedFee } = confirmation
  return (
    <div
      data-testid="send-summary"
      aria-label="Send confirmation summary"
      className="space-y-2 rounded-md border border-primary/20 bg-muted/30 p-3 text-sm"
    >
      <Row label="To" value={recipientLabel ?? `${recipient.slice(0, 8)}…${recipient.slice(-6)}`} />
      <Separator />
      <Row label="Amount" value={`${amount} ${asset}`} testId="summary-amount" />
      <Row label="Network fee" value={`${estimatedFee} XLM`} testId="summary-fee" />
      {memo && <Row label="Memo" value={memo} />}
      <Separator />
      <Row
        label="Total deducted"
        value={`${asset === "XLM" ? amount + estimatedFee : amount} ${asset} + ${estimatedFee} XLM fee`}
        testId="summary-total"
      />
    </div>
  )
}

function Row({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium" data-testid={testId}>{value}</span>
    </div>
  )
}
