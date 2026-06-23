export const colors = {
  background: '#0a0a0a',
  card: '#141414',
  border: '#2a2a2a',
  primary: '#f59e0b',
  primaryForeground: '#0a0a0a',
  foreground: '#fafafa',
  mutedForeground: '#71717a',
  destructive: '#ef4444',
};

export const gradeColor = (score: number | null | undefined): string => {
  if (!score) return colors.mutedForeground;
  if (score >= 90) return '#4ade80';
  if (score >= 80) return '#a3e635';
  if (score >= 70) return '#fbbf24';
  if (score >= 60) return '#fb923c';
  return '#ef4444';
};

export const gradeBorderColor = (score: number | null | undefined): string => {
  if (!score) return colors.border;
  if (score >= 90) return 'rgba(74,222,128,0.3)';
  if (score >= 80) return 'rgba(163,230,53,0.3)';
  if (score >= 70) return 'rgba(251,191,36,0.3)';
  if (score >= 60) return 'rgba(251,146,60,0.3)';
  return 'rgba(239,68,68,0.3)';
};
