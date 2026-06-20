import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import GradeCard from '@/components/GradeCard';
import { Search, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'full_body'];

export default function GradeHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const s = await base44.entities.GradeSession.filter({ athlete_id: user.id, status: 'completed' }, '-session_date', 100);
      setSessions(s);
      setLoading(false);
    };
    init();
  }, []);

  const filtered = sessions.filter(s => {
    const matchSearch = s.exercise?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || s.exercise_category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-heading font-600 mb-1">Performance Log</p>
        <h1 className="font-heading font-900 text-4xl uppercase tracking-wide text-foreground">Grade History</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercise..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-sm pl-10 pr-4 py-2.5 text-foreground text-sm focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-sm text-xs font-heading font-700 uppercase tracking-wide transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-4 font-heading font-600 uppercase tracking-widest">
        {filtered.length} session{filtered.length !== 1 ? 's' : ''}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-card border border-border rounded-sm p-4 h-36 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-sm p-12 text-center">
          <p className="font-heading font-700 uppercase text-foreground mb-2">No sessions found</p>
          <p className="text-muted-foreground text-sm">Try a different filter or submit your first set.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(s => (
            <GradeCard
              key={s.id}
              session={s}
              onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)}
            />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div className="bg-card border border-primary/30 rounded-sm p-6 w-full max-w-lg amber-glow" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-heading font-900 text-2xl uppercase tracking-wide text-foreground">{selectedSession.exercise}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedSession.session_date}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>
            {selectedSession.feedback && (
              <div className="bg-background border border-border rounded-sm p-4 mb-4">
                <p className="text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground mb-2">AI Feedback</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedSession.feedback}</p>
              </div>
            )}
            <GradeCard session={selectedSession} />
          </div>
        </div>
      )}
    </div>
  );
}