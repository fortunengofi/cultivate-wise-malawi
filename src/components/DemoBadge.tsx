const DemoBadge = ({ label = "Demo data" }: { label?: string }) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
    {label}
  </span>
);

export default DemoBadge;
