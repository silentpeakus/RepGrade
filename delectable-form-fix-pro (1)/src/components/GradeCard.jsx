import { cn } from '@/lib/utils';

const gradeColor = (score) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-lime-400';
  if (score >= 70) return 'text-amber-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-500';
};

const gradeBg = (score) => {
  if (score >= 90) return 'border-green-500/30 bg-green-500/5';
  if (score >= 80) return 'border-lime-500/30 bg-lime-500/5';
  if (score >= 70) return 'border-amber-500/30 bg-amber-500/5';
  if (score >= 60) return 'border-orange-500/30 bg-orange-500/5';
  return 'border-red-500/30 bg-red-500/5';
};

export function ScorePill({ label, score }) {
  return (
    <div className={cn('flex flex-col items-center border rounded-sm px-4 py-3', gradeBg(score))}>
      <span className={cn('text-3xl font-heading font-800 leading-none', gradeColor(score))}>
        {score ?? '--'}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold">{label}</span>
    </div>
  );
}

export default function GradeCard({ session, onClick }) {
  const overall = session.overall_grade;
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border rounded-sm p-4 cursor-pointer hover:border-primary/40 transition-all hover:bg-card/80 group',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-heading font-700 text-base uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
            {session.exercise}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {session.session_date} {session.weight_lbs ? `· ${session.weight_lbs} lbs` : ''} {session.reps ? `· ${session.reps} reps` : ''}
          </p>
        </div>
        <div className={cn('text-4xl font-heading font-900 leading-none', gradeColor(overall))}>
          {session.grade_letter || '--'}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ScorePill label="Form" score={session.form_score} />
        <ScorePill label="Intensity" score={session.intensity_score} />
        <ScorePill label="Tempo" score={session.tempo_score} />
      </div>
      {session.ready_to_progress && (
        <div className="mt-3 flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-sm px-3 py-2">
          <span className="text-primary text-xs font-heading font-700 uppercase tracking-wide">
            ↑ Ready to increase weight
          </span>
        </div>
      )}
    </div>
  );
}