export default function StatBlock({ label, value, sub, accent }) {
  return (
    <div className="bg-card border border-border rounded-sm p-5">
      <p className="text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className={`text-4xl font-heading font-900 leading-none ${accent ? 'text-primary' : 'text-foreground'}`}>
        {value ?? '--'}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}