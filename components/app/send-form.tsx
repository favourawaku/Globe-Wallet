"use client"

import { useState, useMemo } from "react"
import { Send, CheckCircle2, AlertCircle, Loader2, Coins, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContactPicker } from "@/components/ui/contact-picker"
import { SendSummary } from "@/components/dashboard/send-summary"
import { useWallet, usePricing } from "@/hooks/useFinanceServices"
import { useBalances } from "@/hooks/useBalances"
import { useContacts } from "@/hooks/useContacts"
import { SendConfirmation } from "@/lib/types"

const ESTIMATED_FEE = 0.00001

export function SendForm() {
  const { sendPayment, validateAddress, isProcessing } = useWallet() as any
  const { formatAsset } = usePricing()
  const { assets } = useBalances()
  const contactsState = useContacts()

  const [step, setStep] = useState<"form" | "confirm">("form")
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedAsset, setSelectedAsset] = useState("XLM")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<SendConfirmation | null>(null)

  const effectiveAddress = contactsState.selected?.address ?? address

  const currentAssetBalance = useMemo(
    () => assets.find(a => a.code === selectedAsset)?.balance ?? 0,
    [assets, selectedAsset]
  )

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateAddress(effectiveAddress)) {
      setError("Invalid Stellar address")
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (numAmount > currentAssetBalance) {
      setError(`Insufficient ${selectedAsset} balance`)
      return
    }

    setConfirmation({
      recipient: effectiveAddress,
      recipientLabel: contactsState.selected?.name,
      amount: numAmount,
      asset: selectedAsset as any,
      memo: memo || undefined,
      estimatedFee: ESTIMATED_FEE,
    })
    setStep("confirm")
  }

  const handleConfirm = async () => {
    if (!confirmation) return
    setError(null)
    try {
      const result = await sendPayment(
        confirmation.recipient,
        confirmation.amount,
        confirmation.asset,
        confirmation.memo
      )
      if (result.status === "completed") {
        setSuccess(
          `Successfully sent ${formatAsset(confirmation.amount, confirmation.asset)} to ${confirmation.recipientLabel ?? confirmation.recipient.slice(0, 8) + "…"}`
        )
        setAddress("")
        setAmount("")
        setMemo("")
        contactsState.select(null)
        setStep("form")
        setConfirmation(null)
      }
    } catch (err: any) {
      setError(err.message || "Failed to send payment")
      setStep("form")
    }
  }

  return (
    <Card
      data-testid="send-form-card"
      className="w-full max-w-md border-primary/20 shadow-2xl bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {step === "confirm" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-1"
              aria-label="Back to form"
              data-testid="back-button"
              onClick={() => { setStep("form"); setError(null) }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Send className="w-5 h-5 text-primary" />
          {step === "confirm" ? "Confirm Send" : "Send Assets"}
        </CardTitle>
        <CardDescription>
          {step === "confirm"
            ? "Review the details before confirming."
            : "Transfer Lumens or tokens securely to any Stellar address."}
        </CardDescription>
      </CardHeader>

      {step === "form" ? (
        <form onSubmit={handleReview} aria-label="Send assets form">
          <CardContent className="space-y-4">
            {/* Contact picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Select Contact</label>
              <ContactPicker
                contacts={contactsState.contacts}
                selected={contactsState.selected}
                query={contactsState.query}
                onQueryChange={contactsState.setQuery}
                onSelect={contactsState.select}
              />
            </div>

            {/* Manual address — hidden when a contact with an address is selected */}
            {!contactsState.selected?.address && (
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">Recipient Address</label>
                <Input
                  id="address"
                  placeholder="e.g. GDXSPAY…"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="bg-background/50"
                  aria-describedby={error ? "send-error" : undefined}
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset</label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="bg-background/50" aria-label="Select asset">
                    <SelectValue placeholder="Asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map(asset => (
                      <SelectItem key={asset.code} value={asset.code}>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-primary" />
                          {asset.code}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="px-1 text-xs text-muted-foreground italic">
              Balance: {formatAsset(currentAssetBalance, selectedAsset as any)}
            </p>

            <div className="space-y-2">
              <label htmlFor="memo" className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Memo
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase opacity-50">Optional</span>
              </label>
              <Input
                id="memo"
                placeholder="Transaction note"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                className="h-8 bg-background/50 text-sm"
              />
            </div>

            {error && (
              <div
                id="send-error"
                role="alert"
                data-testid="send-error"
                className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in zoom-in-95 duration-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                data-testid="send-success"
                className="flex items-start gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 animate-in fade-in zoom-in-95 duration-200"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {success}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" data-testid="review-button">
              <Send className="mr-2 h-4 w-4" />
              Review Send
            </Button>
          </CardFooter>
        </form>
      ) : (
        <div>
          <CardContent className="space-y-4">
            {confirmation && <SendSummary confirmation={confirmation} />}
            {error && (
              <div
                role="alert"
                data-testid="send-error"
                className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              className="w-full group relative overflow-hidden"
              disabled={isProcessing}
              data-testid="confirm-send-button"
              onClick={handleConfirm}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? "Processing…" : "Confirm Send"}
            </Button>
          </CardFooter>
        </div>
      )}
    </Card>
  )
}
