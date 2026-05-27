"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CreditCardIcon, CheckIcon, ZapIcon, BuildingIcon, SparklesIcon, Loader2Icon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "~/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useRouter } from "next/navigation";
import { useUser } from "~/hooks/api/auth";
import { useUpdatePlan, type SubscriptionPlan } from "~/hooks/api/billing";

/* ── Constants ──────────────────────────────────────────────────────── */

const PLANS = [
  {
    id: "free" as SubscriptionPlan,
    name: "Free",
    price: 0,
    desc: "For individuals getting started",
    icon: SparklesIcon,
    accent: "text-zinc-400",
    borderActive: "border-zinc-500/50",
    bgActive: "bg-zinc-500/5",
    features: [
      "3 active forms",
      "100 responses / month",
      "Basic analytics",
      "Unlisted sharing",
      "Community support",
    ],
  },
  {
    id: "pro" as SubscriptionPlan,
    name: "Pro",
    price: 19,
    desc: "For teams shipping serious products",
    icon: ZapIcon,
    accent: "text-emerald-400",
    borderActive: "border-emerald-500/50",
    bgActive: "bg-emerald-500/5",
    highlighted: true,
    features: [
      "Unlimited forms",
      "10,000 responses / month",
      "Advanced analytics",
      "CSV export",
      "Custom slugs",
      "Priority support",
    ],
  },
  {
    id: "enterprise" as SubscriptionPlan,
    name: "Enterprise",
    price: 79,
    desc: "For orgs that need control at scale",
    icon: BuildingIcon,
    accent: "text-violet-400",
    borderActive: "border-violet-500/50",
    bgActive: "bg-violet-500/5",
    features: [
      "Everything in Pro",
      "Unlimited responses",
      "Admin dashboard",
      "SSO & SAML",
      "SLA support",
      "API access",
    ],
  },
] as const;

const PLAN_ORDER: SubscriptionPlan[] = ["free", "pro", "enterprise"];

/* ── Payment form schema ─────────────────────────────────────────────── */

const paymentSchema = z.object({
  cardholderName: z
    .string()
    .min(2, "Cardholder name must be at least 2 characters")
    .max(80, "Cardholder name is too long"),
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .refine(
      (v) => /^\d{4}(\s\d{4}){3}$/.test(v),
      "Enter a valid 16-digit card number"
    ),
  expiryDate: z
    .string()
    .min(1, "Expiry date is required")
    .refine(
      (v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v),
      "Enter a valid expiry date (MM/YY)"
    ),
  cvv: z
    .string()
    .min(1, "CVV is required")
    .refine((v) => /^\d{3,4}$/.test(v), "Enter a valid CVV (3–4 digits)"),
  billingEmail: z.string().email("Enter a valid email address"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

/* ── Helpers ─────────────────────────────────────────────────────────── */

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

/* ── Sub-components ──────────────────────────────────────────────────── */

interface PaymentFormProps {
  targetPlan: (typeof PLANS)[number];
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ targetPlan, onSuccess, onCancel }: PaymentFormProps) {
  const { updatePlanAsync, isPending } = useUpdatePlan();
  const [processing, setProcessing] = React.useState(false);
  const busy = isPending || processing;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (_data: PaymentFormValues) => {
    setProcessing(true);
    try {
      // Simulate payment gateway processing (demo only)
      await new Promise<void>((res) => setTimeout(res, 2000));
      await updatePlanAsync({ plan: targetPlan.id });
      toast.success(`Upgraded to ${targetPlan.name}! Welcome aboard.`);
      onSuccess();
    } catch {
      toast.error("Payment failed. Please check your details and try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-5">
        {/* Cardholder Name */}
        <Field>
          <FieldLabel htmlFor="cardholder-name">Cardholder Name</FieldLabel>
          <Input
            id="cardholder-name"
            placeholder="Jane Smith"
            disabled={busy}
            autoComplete="cc-name"
            {...register("cardholderName")}
          />
          <FieldError errors={errors.cardholderName ? [{ message: errors.cardholderName.message }] : []} />
        </Field>

        {/* Card Number */}
        <Field>
          <FieldLabel htmlFor="card-number">Card Number</FieldLabel>
          <div className="relative">
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              disabled={busy}
              autoComplete="cc-number"
              inputMode="numeric"
              maxLength={19}
              className="pr-10"
              {...register("cardNumber", {
                onChange: (e) => {
                  e.target.value = formatCardNumber(e.target.value);
                  setValue("cardNumber", e.target.value, { shouldValidate: false });
                },
              })}
            />
            <CreditCardIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <FieldError errors={errors.cardNumber ? [{ message: errors.cardNumber.message }] : []} />
        </Field>

        {/* Expiry + CVV side by side */}
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="expiry-date">Expiry Date</FieldLabel>
            <Input
              id="expiry-date"
              placeholder="MM/YY"
              disabled={busy}
              autoComplete="cc-exp"
              inputMode="numeric"
              maxLength={5}
              {...register("expiryDate", {
                onChange: (e) => {
                  e.target.value = formatExpiry(e.target.value);
                  setValue("expiryDate", e.target.value, { shouldValidate: false });
                },
              })}
            />
            <FieldError errors={errors.expiryDate ? [{ message: errors.expiryDate.message }] : []} />
          </Field>

          <Field>
            <FieldLabel htmlFor="cvv">CVV</FieldLabel>
            <Input
              id="cvv"
              placeholder="•••"
              disabled={busy}
              autoComplete="cc-csc"
              inputMode="numeric"
              maxLength={4}
              type="password"
              {...register("cvv")}
            />
            <FieldError errors={errors.cvv ? [{ message: errors.cvv.message }] : []} />
          </Field>
        </div>

        {/* Billing Email */}
        <Field>
          <FieldLabel htmlFor="billing-email">Billing Email</FieldLabel>
          <Input
            id="billing-email"
            type="email"
            placeholder="you@company.com"
            disabled={busy}
            autoComplete="email"
            {...register("billingEmail")}
          />
          <FieldDescription>Receipts will be sent to this address.</FieldDescription>
          <FieldError errors={errors.billingEmail ? [{ message: errors.billingEmail.message }] : []} />
        </Field>
      </FieldGroup>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy} className="min-w-[140px]">
          {busy ? (
            <>
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              {processing ? "Processing…" : "Upgrading…"}
            </>
          ) : (
            `Pay $${targetPlan.price}/mo`
          )}
        </Button>
      </div>
    </form>
  );
}

/* ── Main page ───────────────────────────────────────────────────────── */

export default function BillingPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { updatePlanAsync, isPending: isDowngrading } = useUpdatePlan();

  React.useEffect(() => {
    if (!isLoading && !user?.id) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user?.id) return null;

  const currentPlan: SubscriptionPlan = (user?.plan as SubscriptionPlan) ?? "free";

  const [upgradeTarget, setUpgradeTarget] = React.useState<(typeof PLANS)[number] | null>(null);
  const [downgradeTarget, setDowngradeTarget] = React.useState<(typeof PLANS)[number] | null>(null);

  const handleDowngrade = async () => {
    if (!downgradeTarget) return;
    try {
      await updatePlanAsync({ plan: downgradeTarget.id });
      toast.success(`Switched to ${downgradeTarget.name} plan.`);
    } catch {
      toast.error("Could not change plan. Please try again.");
    } finally {
      setDowngradeTarget(null);
    }
  };

  const planAction = (plan: (typeof PLANS)[number]) => {
    if (plan.id === currentPlan) return null;
    const current = PLAN_ORDER.indexOf(currentPlan);
    const target = PLAN_ORDER.indexOf(plan.id);
    return target > current ? "upgrade" : "downgrade";
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
          <CreditCardIcon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing &amp; Subscription</h1>
          <p className="text-sm text-muted-foreground">Manage your plan and payment details.</p>
        </div>
      </div>

      {/* Current plan summary */}
      {!isLoading && user && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-border/70 bg-card/40 px-5 py-4">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current plan</p>
            <p className="mt-0.5 text-lg font-semibold capitalize tracking-tight">{currentPlan}</p>
          </div>
          <PlanBadge plan={currentPlan} />
        </div>
      )}

      {/* Plan cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const action = planAction(plan);
          const isCurrent = plan.id === currentPlan;
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border p-6 transition-colors ${
                isCurrent
                  ? `${plan.borderActive} ${plan.bgActive}`
                  : "border-border/70 bg-card/40 hover:border-border"
              }`}
            >
              {"highlighted" in plan && plan.highlighted && !isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                  Most popular
                </span>
              )}

              {isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground">
                  Current plan
                </span>
              )}

              <div className="mb-4 flex items-center gap-2.5">
                <div className={`flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 ${plan.accent}`}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.desc}</p>
                </div>
              </div>

              <div className="mb-5 flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight">${plan.price}</span>
                <span className="mb-1 text-sm text-muted-foreground">/mo</span>
              </div>

              <Separator className="mb-5 opacity-50" />

              <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckIcon className={`mt-0.5 size-3.5 shrink-0 ${plan.accent}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {isLoading ? (
                <Button variant="outline" disabled className="w-full">
                  Loading…
                </Button>
              ) : isCurrent ? (
                <Button variant="outline" disabled className="w-full">
                  <CheckIcon className="mr-1.5 size-3.5" />
                  Active plan
                </Button>
              ) : action === "upgrade" ? (
                <Button
                  className="w-full"
                  onClick={() => setUpgradeTarget(plan as typeof plan)}
                  disabled={isDowngrading}
                >
                  {plan.price === 0 ? "Switch to Free" : `Upgrade to ${plan.name}`}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => setDowngradeTarget(plan as typeof plan)}
                  disabled={isDowngrading}
                >
                  Downgrade to {plan.name}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Notice */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        This is a demo billing flow — no real charges are made. Cancel or change plans at any time.
      </p>

      {/* Upgrade payment dialog */}
      <Dialog open={!!upgradeTarget} onOpenChange={(open) => !open && setUpgradeTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Upgrade to {upgradeTarget?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your payment details to activate{" "}
              <span className="font-medium text-foreground">{upgradeTarget?.name}</span> at{" "}
              <span className="font-medium text-foreground">${upgradeTarget?.price}/mo</span>.
              This is a demo — no real charge is made.
            </DialogDescription>
          </DialogHeader>

          <Separator className="opacity-50" />

          {upgradeTarget && (
            <PaymentForm
              targetPlan={upgradeTarget}
              onSuccess={() => setUpgradeTarget(null)}
              onCancel={() => setUpgradeTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Downgrade confirmation dialog */}
      <AlertDialog open={!!downgradeTarget} onOpenChange={(open) => !open && setDowngradeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Downgrade to {downgradeTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll lose access to{" "}
              <span className="font-medium text-foreground capitalize">{currentPlan}</span> features
              immediately. You can upgrade again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDowngrade()} disabled={isDowngrading}>
              {isDowngrading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Downgrading…
                </>
              ) : (
                `Yes, switch to ${downgradeTarget?.name}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Shared plan badge ──────────────────────────────────────────────── */

export function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
  const styles: Record<SubscriptionPlan, string> = {
    free: "border-zinc-700/60 bg-zinc-700/30 text-zinc-300",
    pro: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    enterprise: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${styles[plan]}`}
    >
      {plan}
    </span>
  );
}
