// Indicator configuration
export const INDICATORS = [
  {
    id: "capital",
    name: "Registered Capital",
    options: [
      { value: 0, label: "Above $10M", grade: "A" },
      { value: 1, label: "$3M - $10M", grade: "B" },
      { value: 2, label: "Below $3M", grade: "C" },
    ],
  },
  {
    id: "yearsFounded",
    name: "Years in Business",
    options: [
      { value: 0, label: "5+ years", grade: "A" },
      { value: 1, label: "3-5 years", grade: "B" },
      { value: 2, label: "Under 3 years", grade: "C" },
    ],
  },
  {
    id: "employees",
    name: "Employee Count",
    options: [
      { value: 0, label: "200+ employees", grade: "A" },
      { value: 1, label: "50-200 employees", grade: "B" },
      { value: 2, label: "Under 50 employees", grade: "C" },
    ],
  },
  {
    id: "tax",
    name: "Annual Tax Payment",
    options: [
      { value: 0, label: "Above $5M", grade: "A" },
      { value: 1, label: "$1M - $5M", grade: "B" },
      { value: 2, label: "Below $1M", grade: "C" },
    ],
  },
  {
    id: "revenue",
    name: "Annual Revenue",
    options: [
      { value: 0, label: "Above $50M", grade: "A" },
      { value: 1, label: "$10M - $50M", grade: "B" },
      { value: 2, label: "Below $10M", grade: "C" },
    ],
  },
  {
    id: "lawsuit",
    name: "Litigation Record",
    options: [
      { value: 0, label: "None", grade: "✓" },
      { value: 1, label: "Has Record", grade: "✗" },
    ],
  },
] as const;

// Grade info mapping
export const GRADE_INFO = {
  0: { name: "Grade A", title: "Large Vendor Potential", emoji: "🥇", color: "text-emerald-500" },
  1: { name: "Grade B", title: "Medium Vendor Potential", emoji: "🥈", color: "text-blue-500" },
  2: { name: "Grade C", title: "Small Vendor Potential", emoji: "🥉", color: "text-amber-500" },
} as const;

// Improvement suggestions
export const IMPROVEMENT_SUGGESTIONS: Record<string, Record<number, string>> = {
  capital: {
    1: "Increase registered capital to above $10M to achieve Grade A",
    2: "Increase registered capital to above $3M to achieve Grade B",
  },
  yearsFounded: {
    1: "This metric will automatically upgrade to A after 5 years",
    2: "This metric will upgrade to B after 3 years",
  },
  employees: {
    1: "Expand team to 200+ employees to achieve Grade A",
    2: "Expand team to 50+ employees to achieve Grade B",
  },
  tax: {
    1: "Increase annual tax payment to $5M+ to achieve Grade A",
    2: "Increase annual tax payment to $1M+ to achieve Grade B",
  },
  revenue: {
    1: "Increase annual revenue to $50M+ to achieve Grade A",
    2: "Increase annual revenue to $10M+ to achieve Grade B",
  },
  lawsuit: {
    1: "Resolve existing litigation to remove rating cap",
  },
};
