export function formatDateTime(iso?: string | Date): string {
  if (!iso) return "";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
