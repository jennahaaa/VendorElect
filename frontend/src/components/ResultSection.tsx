"use client";

import { INDICATORS, GRADE_INFO, IMPROVEMENT_SUGGESTIONS } from "@/lib/constants";

interface ResultSectionProps {
  overallGrade: number;
  itemGrades: Record<string, number>;
  txHash: string;
  timestamp: number;
  onReset: () => void;
}

export function ResultSection({
  overallGrade,
  itemGrades,
  txHash,
  timestamp,
  onReset,
}: ResultSectionProps) {
  const gradeInfo = GRADE_INFO[overallGrade as keyof typeof GRADE_INFO];

  // Generate improvement suggestions
  const suggestions: string[] = [];
  let aCount = 0;

  INDICATORS.forEach((indicator) => {
    const grade = itemGrades[indicator.id];
    if (grade === 0) aCount++;
    if (grade !== undefined && grade > 0) {
      const suggestion = IMPROVEMENT_SUGGESTIONS[indicator.id]?.[grade];
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
  });

  // Overall suggestion
  if (overallGrade === 1 && aCount >= 3) {
    suggestions.push(`Currently ${aCount} Grade A metrics. Improve ${4 - aCount} more to achieve overall Grade A`);
  }

  return (
    <section id="result" className="min-h-screen py-12 px-6 bg-white flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Overall grade display */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="text-7xl mb-3">{gradeInfo.emoji}</div>
          <h2 className={`text-4xl font-bold mb-1 ${gradeInfo.color}`}>
            {gradeInfo.name}
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">{gradeInfo.title}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

        {/* Indicator details */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-xl font-bold text-[var(--primary)] mb-4">
            Indicator Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {INDICATORS.map((indicator) => {
              const grade = itemGrades[indicator.id];
              const gradeLabel = indicator.id === "lawsuit"
                ? (grade === 0 ? "✅ None" : "❌ Has Record")
                : (grade === 0 ? "A" : grade === 1 ? "B" : "C");
              const gradeClass = indicator.id === "lawsuit"
                ? (grade === 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")
                : (grade === 0 ? "bg-emerald-100 text-emerald-700" : grade === 1 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700");

              return (
                <div
                  key={indicator.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <p className="text-base font-medium text-[var(--primary)] mb-2">
                    {indicator.name}
                  </p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${gradeClass}`}>
                    {gradeLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

        {/* Improvement suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4 flex items-center gap-2">
              <span>💡</span> Improvement Suggestions
            </h3>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-base text-[var(--primary)]"
                >
                  <span className="text-[var(--accent)]">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

        {/* Re-rate button */}
        <div className="text-center mb-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <button
            onClick={onReset}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold text-base"
          >
            Rate Again
          </button>
        </div>

        {/* On-chain info */}
        <div className="text-center text-sm text-[var(--primary)] space-y-1 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <p>
            On-chain Record:
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline ml-2 font-medium"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          </p>
          <p>
            Rating Time: {new Date(timestamp * 1000).toLocaleString("en-US")}
          </p>
        </div>
      </div>
    </section>
  );
}
