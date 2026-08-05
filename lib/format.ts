export function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}

export function salaryFmt(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function relativeStart(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffH = Math.round(diffMs / 3600000);
  if (diffH <= 0) return "Live now";
  if (diffH < 24) return `Starts in ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  return `Starts in ${diffD}d`;
}
