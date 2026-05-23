export const formatNumber = (value: number, decimals = 2): string => {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Strong Bullish";
  if (score >= 65) return "Bullish";
  if (score >= 50) return "Neutral";
  if (score >= 35) return "Bearish";
  return "Strong Bearish";
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 65) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  if (score >= 35) return "text-orange-500";
  return "text-red-600";
};

export const downloadJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        return typeof value === "string" ? `"${value}"` : value;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const debounce = (
  fn: (...args: any[]) => void,
  delay: number
): ((...args: any[]) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

export const classNames = (...classes: (string | false | undefined)[]): string => {
  return classes.filter(Boolean).join(" ");
};
