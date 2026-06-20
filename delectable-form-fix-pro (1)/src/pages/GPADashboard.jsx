import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import StatBlock from '@/components/StatBlock';
import { ArrowUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function GPADashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const s = await base44.entities.GradeSession.filter({ athlete_id: user.id, status: 'completed' }, '-session_date', 200);
      setSessions(s);
      setLoading(false);
    };
    init();
  }, []);

  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  const overallGpa = avg(sessions.map(s => s.overall_grade).filter(Boolean));
  const formAvg = avg(sessions.map(s => s.form_score).filter(Boolean));
  const intensityAvg = avg(sessions.map(s => s.intensity_score).filter(Boolean));
  const tempoAvg = avg(sessions.map(s => s.tempo_score).filter(Boolean));

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

  // Per-exercise breakdown
  const exerciseMap = {};
  sessions.forEach(s => {
    if (!exerciseMap[s.exercise]) exerciseMap[s.exercise] = [];
    exerciseMap[s.exercise].push(s);
  });

  const exerciseBreakdown = Object.entries(exerciseMap)
    .map(([exercise, sArr]) => ({
      exercise,
      avgGrade: avg(sArr.map(s => s.overall_grade).filter(Boolean)),
      formAvg: avg(sArr.map(s => s.form_score).filter(Boolean)),
      tempoAvg: avg(sArr.map(s => s.tempo_score).filter(Boolean)),
      intensityAvg: avg(sArr.map(s => s.intensity_score).filter(Boolean)),
      count: sArr.length,
      readyToProgress: sArr.some(s => s.ready_to_progress),
    }))
    .sort((a, b) => (a.avgGrade || 0) - (b.avgGrade || 0));

  const radarData = [
    { dimension: 'Form', score: formAvg || 0 },
    { dimension: 'Intensity', score: intensityAvg || 0 },
    { dimension: 'Tempo', score: tempoAvg || 0 },
  ];

  const weakestDimension = [
    { name: 'Form', score: formAvg },
    { name: 'Intensity', score: intensityAvg },
    { name: 'Tempo', score: tempoAvg },
  ].filter(d => d.score).sort((a, b) => a.score - b.score)[0];

  const readyList = exerciseBreakdown.filter(e => e.readyToProgress);

  const scoreColor = (score) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-lime-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-500';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-heading font-600 mb-1">Performance Intelligence</p>
        <h1 className="font-heading font-900 text-4xl uppercase tracking-wide text-foreground">My GPA</h1>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatBlock label="Overall GPA" value={overallGpa || '--'} sub={gradeToLetter(overallGpa)} accent />
        <StatBlock label="Form Avg" value={formAvg || '--'} sub="Technique score" />
        <StatBlock label="Tempo Avg" value={tempoAvg || '--'} sub="Pace consistency" />
        <StatBlock label="Intensity Avg" value={intensityAvg || '--'} sub="Effort level" />
      </div>

      {sessions.length === 0 && !loading ? (
        <div className="bg-card border border-border rounded-sm p-12 text-center">
          <p className="font-heading font-700 uppercase text-foreground mb-2">No data yet</p>
          <p className="text-muted-foreground text-sm">Submit sets to build your GPA over time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Radar */}
          <div className="bg-card border border-border rounded-sm p-5">
            <p className="text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground mb-4">Score Breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#3A3A3C" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#888', fontSize: 11, fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }} />
                <Radar dataKey="score" stroke="#FF8C00" fill="#FF8C00" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#2C2C2E', border: '1px solid #3A3A3C', color: '#fff', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Weak point */}
          <div className="md:col-span-2 space-y-3">
            {weakestDimension && (
              <div className="bg-card border border-orange-500/30 rounded-sm p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-800 text-sm uppercase tracking-wide text-foreground mb-1">
                    Focus Area: {weakestDimension.name}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your {weakestDimension.name.toLowerCase()} score ({weakestDimension.score}) is your lowest dimension.
                    Prioritize controlled {weakestDimension.name.toLowerCase() === 'tempo' ? 'rep timing' : weakestDimension.name.toLowerCase() === 'form' ? 'technique work' : 'effort consistency'} on your next sets.
                  </p>
                </div>
              </div>
            )}
            {readyList.length > 0 && (
              <div className="bg-card border border-green-500/30 rounded-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUp className="w-4 h-4 text-green-400" />
                  <p className="font-heading font-800 text-sm uppercase tracking-wide text-green-400">
                    Ready to Progress ({readyList.length})
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {readyList.map(e => (
                    <span key={e.exercise} className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-heading font-700 uppercase tracking-wide px-3 py-1 rounded-sm">
                      {e.exercise}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercise breakdown table */}
      {exerciseBreakdown.length > 0 && (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="font-heading font-800 text-base uppercase tracking-wide text-foreground">Exercise Breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  {['Exercise', 'Avg Grade', 'Form', 'Intensity', 'Tempo', 'Sessions', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exerciseBreakdown.map((e, i) => (
                  <tr key={e.exercise} className={`border-b border-border/50 hover:bg-white/5 transition-colors ${i === 0 ? 'bg-red-500/3' : ''}`}>
                    <td className="px-5 py-3 font-heading font-700 uppercase text-xs tracking-wide text-foreground">{e.exercise}</td>
                    <td className={`px-5 py-3 font-heading font-900 text-lg ${scoreColor(e.avgGrade)}`}>{e.avgGrade || '--'}</td>
                    <td className={`px-5 py-3 font-semibold ${scoreColor(e.formAvg)}`}>{e.formAvg || '--'}</td>
                    <td className={`px-5 py-3 font-semibold ${scoreColor(e.intensityAvg)}`}>{e.intensityAvg || '--'}</td>
                    <td className={`px-5 py-3 font-semibold ${scoreColor(e.tempoAvg)}`}>{e.tempoAvg || '--'}</td>
                    <td className="px-5 py-3 text-muted-foreground">{e.count}</td>
                    <td className="px-5 py-3">
                      {e.readyToProgress && (
                        <CheckCircle className="w-4 h-4 text-green-400" title="Ready to progress" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}