interface MetricsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  highlight?: boolean;
}

export default function MetricsCard({ label, value, unit, subtitle, highlight = false }: MetricsCardProps) {
  const numVal = typeof value === "number" ? value : parseFloat(String(value));
  const displayVal = isNaN(numVal) ? String(value) : numVal.toFixed(numVal < 10 ? 4 : 2);

  return (
    <div className={`surface-card space-y-2 p-5 ${highlight ? "border-primary/60 bg-primary/5" : ""}`}>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-4xl font-semibold tracking-[-0.05em] text-foreground tabular-nums">
        {displayVal}
        {unit && <span className="text-lg font-normal text-muted-foreground ml-1">{unit}</span>}
      </div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );
}
