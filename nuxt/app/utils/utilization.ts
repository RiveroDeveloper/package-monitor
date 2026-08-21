export function utilization(currentLoad: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.round((currentLoad / capacity) * 100);
}

export function utilizationColor(percent: number): string {
  if (percent > 90) return 'bg-rose-500';
  if (percent > 70) return 'bg-amber-500';
  return 'bg-primary';
}
