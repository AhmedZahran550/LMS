"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

interface PlanFeature {
  label: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: number;
  currency: string;
  description: string;
  durationMonths?: number;
  features: PlanFeature[];
  isCurrentPlan: boolean;
  isPopular?: boolean;
  onSelect?: () => void;
  buttonLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function PlanCard({
  name,
  price,
  currency,
  description,
  durationMonths = 6,
  features,
  isCurrentPlan,
  isPopular,
  onSelect,
  buttonLabel,
  isLoading,
  className,
}: PlanCardProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "relative rounded-xl border p-6 flex flex-col transition-shadow hover:shadow-md",
        isCurrentPlan
          ? "border-[var(--sv-primary)] bg-[var(--sv-primary-container)]/10"
          : isPopular
            ? "border-[var(--sv-accent-500)] bg-[var(--sv-surface-container-low)]"
            : "border-[var(--sv-outline-variant)] bg-[var(--sv-surface-container-low)]",
        className,
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--sv-accent-500)] text-white text-xs font-bold">
          {t("Popular")}
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-[var(--sv-on-surface)] capitalize">
          {name}
        </h3>
        <p className="text-sm text-[var(--sv-on-surface-variant)] mt-1">
          {description}
        </p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-black text-[var(--sv-on-surface)]">
          {price === 0
            ? t("Free")
            : `${currency === "usd" ? "$" : currency.toUpperCase()} ${(price / durationMonths).toFixed(2)}`}
        </span>
        {price > 0 && (
          <span className="text-sm text-[var(--sv-on-surface-variant)] ml-1">
            {t("/month for {{months}} months", { months: durationMonths })}
          </span>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check
              className={cn(
                "h-5 w-5 mt-0.5 flex-shrink-0",
                feature.included
                  ? "text-[var(--sv-primary)]"
                  : "text-[var(--sv-on-surface-variant)] opacity-40",
              )}
            />
            <span
              className={cn(
                "text-sm",
                feature.included
                  ? "text-[var(--sv-on-surface)]"
                  : "text-[var(--sv-on-surface-variant)] opacity-60",
              )}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      {onSelect && (
        <Button
          onClick={onSelect}
          variant={
            isCurrentPlan ? "outline" : isPopular ? "default" : "secondary"
          }
          isLoading={isLoading}
          disabled={isCurrentPlan}
          className="w-full"
        >
          {isCurrentPlan ? t("Current Plan") : buttonLabel || t("Upgrade")}
        </Button>
      )}
    </div>
  );
}
