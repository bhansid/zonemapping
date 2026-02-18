export function formatDate(value: string) {
  if (!value) return "";

  const d = new Date(value);
  if (isNaN(d.getTime())) return value;

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
