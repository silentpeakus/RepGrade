import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Copy, CheckCircle, AlertCircle, TrendingDown, Clock } from 'lucide-react';
import StatBlock from '@/components/StatBlock';

export default function TrainerDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [athleteData, setAthleteData] = useState({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [athleteSessions, setAthleteSessions] = useState([]);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) setProfile(profiles[0]);

      const links = await base44.entities.TrainerAthlete.filter({ trainer_id: u.id, status: 'active' });
      setAthletes(links);

      // Fetch session data for each athlete
      const data = {};
      for (const link of links) {
        if (link.athlete_id) {
          const sessions = await base44.entities.GradeSession.filter(
            { athlete_id: link.athlete_id, status: 'completed' },
            '-session_date',
            50
          );
          const avg = sessions.length
            ? Math.round(sessions.reduce((acc, s) => acc + (s.overall_grade || 0), 0) / sessions.length)
            : null;
          const lastSession = sessions[0];
          const daysSince = lastSession
            ? Math.floor((Date.now() - new Date(lastSession.session_date)) / 86400000)
            : null;
          data[link.athlete_id] = { sessions, avg, lastSession, daysSince };
        }
      }
      setAthleteData(data);
      setLoading(false);
    };
    init();
  }, []);

  const handleCopyCode = () => {
    if (profile?.trainer_code) {
      navigator.clipboard.writeText(profile.trainer_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join?code=${profile?.trainer_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewAthlete = async (link) => {
    setSelectedAthlete(link);
    const sessions = await base44.entities.GradeSession.filter(
      { athlete_id: link.athlete_id, status: 'completed' },
      '-session_date',
      20
    );
    setAthleteSessions(sessions);
  };

  const scoreColor = (score) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-lime-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-500';
  };

  const alertBadge = (athleteId) => {
    const d = athleteData[athleteId];
    if (!d) return null;
    if (d.daysSince !== null && d.daysSince > 7) return 'inactive';
    if (d.avg !== null && d.avg < 70) return 'low-grade';
    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-heading font-600 mb-1">Trainer View</p>
        <h1 className="font-heading font-900 text-4xl uppercase tracking-wide text-foreground">
          {user?.full_name?.split(' ')[0]}'s Dashboard
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatBlock label="Athletes" value={athletes.length} sub="Active clients" accent />
        <StatBlock
          label="Alerts"
          value={athletes.filter(a => alertBadge(a.athlete_id)).length}
          sub="Need attention"
        />
        <StatBlock
          label="Avg GPA"
          value={
            Object.values(athleteData).filter(d => d.avg).length
              ? Math.round(Object.values(athleteData).reduce((acc, d) => acc + (d.avg || 0), 0) / Object.values(athleteData).filter(d => d.avg).length)
              : '--'
          }
          sub="Across all clients"
        />
        <StatBlock label="Your Code" value={profile?.trainer_code || '--'} sub="Invite code" />
      </div>

      {/* Invite section */}
      <div className="bg-card border border-primary/30 rounded-sm p-5 mb-8 amber-glow">
        <p className="font-heading font-800 text-sm uppercase tracking-widest text-muted-foreground mb-3">Invite Athletes</p>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-3 bg-background border border-border rounded-sm px-4 py-3 flex-1">
            <span className="font-heading font-900 text-2xl text-primary tracking-widest">
              {profile?.trainer_code || '...'}
            </span>
            <span className="text-muted-foreground text-sm">— Your invite code</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-heading font-700 text-sm uppercase tracking-wide px-4 py-2 rounded-sm hover:bg-amber-light transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy Code
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-secondary border border-border text-foreground font-heading font-700 text-sm uppercase tracking-wide px-4 py-2 rounded-sm hover:border-primary/40 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Athletes list */}
      <div className="bg-card border border-border rounded-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <p className="font-heading font-800 text-base uppercase tracking-wide text-foreground">Athletes</p>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-background rounded-sm animate-pulse" />)}
          </div>
        ) : athletes.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-700 uppercase text-foreground mb-1">No athletes yet</p>
            <p className="text-muted-foreground text-sm">Share your invite code to add clients.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                {['Athlete', 'Avg GPA', 'Last Session', 'Sessions', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {athletes.map(link => {
                const d = athleteData[link.athlete_id] || {};
                const alert = alertBadge(link.athlete_id);
                return (
                  <tr key={link.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{link.athlete_name?.[0] || '?'}</span>
                        </div>
                        <span className="font-heading font-700 uppercase text-xs tracking-wide text-foreground">{link.athlete_name || link.athlete_email}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-3 font-heading font-900 text-xl ${scoreColor(d.avg)}`}>{d.avg || '--'}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {d.daysSince !== null ? `${d.daysSince}d ago` : 'Never'}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{d.sessions?.length || 0}</td>
                    <td className="px-5 py-3">
                      {alert === 'inactive' && (
                        <span className="flex items-center gap-1 text-orange-400 text-xs font-heading font-700 uppercase">
                          <Clock className="w-3 h-3" /> Inactive
                        </span>
                      )}
                      {alert === 'low-grade' && (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-heading font-700 uppercase">
                          <TrendingDown className="w-3 h-3" /> Low GPA
                        </span>
                      )}
                      {!alert && <span className="text-green-400 text-xs font-heading font-700 uppercase">Active</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleViewAthlete(link)}
                        className="text-primary text-xs font-heading font-700 uppercase tracking-wide hover:underline"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Athlete detail modal */}
      {selectedAthlete && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAthlete(null)}>
          <div className="bg-card border border-primary/30 rounded-sm p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto amber-glow" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-900 text-2xl uppercase tracking-wide text-foreground">
                {selectedAthlete.athlete_name}'s History
              </h2>
              <button onClick={() => setSelectedAthlete(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            {athleteSessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No sessions recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Date', 'Exercise', 'Grade', 'Form', 'Tempo', 'Intensity'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {athleteSessions.map(s => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-white/5">
                      <td className="px-3 py-2 text-muted-foreground text-xs">{s.session_date}</td>
                      <td className="px-3 py-2 font-heading font-700 uppercase text-xs text-foreground">{s.exercise}</td>
                      <td className={`px-3 py-2 font-heading font-900 text-lg ${scoreColor(s.overall_grade)}`}>{s.grade_letter}</td>
                      <td className={`px-3 py-2 ${scoreColor(s.form_score)}`}>{s.form_score}</td>
                      <td className={`px-3 py-2 ${scoreColor(s.tempo_score)}`}>{s.tempo_score}</td>
                      <td className={`px-3 py-2 ${scoreColor(s.intensity_score)}`}>{s.intensity_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}