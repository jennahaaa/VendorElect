"use client";

import { INDICATORS } from "@/lib/constants";
import { useAccount } from "wagmi";

interface IndicatorSectionProps {
  selections: Record<string, number | null>;
  onSelect: (indicatorId: string, value: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  status: string;
}

export function IndicatorSection({
  selections,
  onSelect,
  onSubmit,
  isSubmitting,
  status,
}: IndicatorSectionProps) {
  const { isConnected } = useAccount();
  
  const allSelected = INDICATORS.every(
    (ind) => selections[ind.id] !== null && selections[ind.id] !== undefined
  );

  return (
    <section id="indicators" className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-4">
            Select Rating Indicators
          </h2>
          <p className="text-[var(--text-muted)]">
            Please select one tier for each of the 6 indicators below
          </p>
        </div>

        {/* Indicator list */}
        <div className="space-y-10">
          {INDICATORS.map((indicator, index) => (
            <div
              key={indicator.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Indicator title */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold text-[var(--primary)]">
                  {indicator.name}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-[var(--primary)]/20 to-transparent" />
              </div>

              {/* Option cards */}
              <div className={`grid gap-4 ${indicator.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {indicator.options.map((option) => {
                  const isSelected = selections[indicator.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => onSelect(indicator.id, option.value)}
                      className={`option-card relative p-6 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "selected border-[var(--accent)] bg-[var(--accent)]/5"
                          : "border-gray-200 hover:border-[var(--primary)]/30 bg-white"
                      }`}
                    >
                      {/* Selected mark */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Grade badge */}
                      <div className={`grade-badge mb-3 ${
                        option.grade === "A" ? "grade-a" :
                        option.grade === "B" ? "grade-b" :
                        option.grade === "C" ? "grade-c" :
                        option.grade === "✓" ? "bg-emerald-500 text-white" :
                        "bg-red-500 text-white"
                      }`}>
                        {option.grade}
                      </div>

                      {/* Option text */}
                      <p className="font-medium text-[var(--text-primary)]">
                        {option.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="mt-16 text-center">
          <button
            onClick={onSubmit}
            disabled={!isConnected || !allSelected || isSubmitting}
            className="btn-primary inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner" />
                {status}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                🔐 Encrypt & Submit
              </>
            )}
          </button>
          {!isConnected && (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Connect wallet to submit
            </p>
          )}
          {isConnected && !allSelected && (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Please complete all indicator selections
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
