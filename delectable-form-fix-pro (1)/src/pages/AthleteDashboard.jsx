import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StatBlock from '@/components/StatBlock';
import GradeCard from '@/components/GradeCard';
import { Upload, TrendingUp, Zap } from 'lucide-react';

export default function AthleteDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) setProfile(profiles[0]);
      const s = await base44.entities.GradeSession.filter({ athlete_id: u.id }, '-session_date', 20);
      setSessions(s);
      setLoading(false);
    };
    init();
  }, []);

  const completed = sessions.filter(s => s.status === 'completed');
  const avgGpa = completed.length
    ? Math.round(completed.reduce((acc, s) => acc + (s.overall_grade || 0), 0) / completed.length)
    : null;
  const readyToProgress = completed.filter(s => s.ready_to_progress);
  const recentSessions = completed.slice(0, 4);

  const gradeToLetter = (score) => {
    if (!score) return '--';
    if (score >= 93) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 87) return 'A-';
    if (score >= 83) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 77) return 'B-';
    if (score >= 73) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-heading font-600 mb-1">Welcome back</p>
        <h1 className="font-heading font-900 text-4xl uppercase tracking-wide text-foreground">
          {user?.full_name?.split(' ')[0] || 'Athlete'}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatBlock label="Overall GPA" value={avgGpa ? `${avgGpa}` : '--'} sub="Combined score" accent />
        <StatBlock label="Grade" value={gradeToLetter(avgGpa)} sub="Letter grade" />
        <StatBlock label="Sessions" value={completed.length} sub="Completed" />
        <StatBlock label="Ready to Progress" value={readyToProgress.length} sub="Exercises" accent />
      </div>

      {/* CTA */}
      <div className="bg-card border border-primary/30 rounded-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 amber-glow">
        <div>
          <h2 className="font-heading font-800 text-2xl uppercase tracking-wide text-foreground mb-1">
            Submit Your Next Set
          </h2>
          <p className="text-muted-foreground text-sm">Upload a video or record live. Get graded in seconds.</p>
        </div>
        <Link
          to="/submit"
          className="flex items-center gap-2 bg-primary text-primary-foreground font-heading font-800 text-sm uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-amber-light transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          Grade My Set
        </Link>
      </div>

      {/* Recent sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-800 text-xl uppercase tracking-wide text-foreground">Recent Sessions</h2>
          <Link to="/history" className="text-xs text-primary font-semibold uppercase tracking-wider hover:underline">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-card border border-border rounded-sm p-4 h-32 animate-pulse" />
            ))}
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="bg-card border border-border rounded-sm p-8 text-center">
            <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="font-heading font-700 uppercase text-foreground mb-1">No sessions yet</p>
            <p className="text-muted-foreground text-sm">Submit your first set to get graded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentSessions.map(s => <GradeCard key={s.id} session={s} />)}
          </div>
        )}
      </div>

      {/* Progress link */}
      <Link
        to="/gpa"
        className="flex items-center gap-3 bg-card border border-border rounded-sm p-5 hover:border-primary/40 transition-all group"
      >
        <TrendingUp className="w-6 h-6 text-primary" />
        <div className="flex-1">
          <p className="font-heading font-800 text-base uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
            View Full GPA Breakdown
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">See which exercises and dimensions need work</p>
        </div>
        <span className="text-primary font-bold">→</span>
      </Link>
    </div>
  );
}