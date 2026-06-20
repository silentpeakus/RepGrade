import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function JoinTrainer() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill from URL param
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) setCode(urlCode);
  }, []);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    const trainerProfiles = await base44.entities.UserProfile.filter({ trainer_code: code.trim().toUpperCase() });
    if (trainerProfiles.length === 0) {
      setError('Invalid invite code. Please check with your trainer.');
      setLoading(false);
      return;
    }

    const trainerProfile = trainerProfiles[0];
    const user = await base44.auth.me();

    // Update athlete profile
    const myProfiles = await base44.entities.UserProfile.filter({ user_id: user.id });
    if (myProfiles.length > 0) {
      await base44.entities.UserProfile.update(myProfiles[0].id, {
        linked_trainer_id: trainerProfile.user_id,
      });
    }

    // Create TrainerAthlete link
    const existing = await base44.entities.TrainerAthlete.filter({
      trainer_id: trainerProfile.user_id,
      athlete_id: user.id,
    });
    if (existing.length === 0) {
      await base44.entities.TrainerAthlete.create({
        trainer_id: trainerProfile.user_id,
        athlete_id: user.id,
        athlete_email: user.email,
        athlete_name: user.full_name,
        status: 'active',
        invite_code: code.trim().toUpperCase(),
        linked_date: new Date().toISOString().split('T')[0],
      });
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-heading font-900 text-3xl uppercase tracking-wider text-foreground">RepGrade</span>
        </div>

        <h1 className="font-heading font-900 text-4xl uppercase tracking-wide text-foreground text-center mb-2">
          Join Your Trainer
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">Enter the invite code your trainer shared with you.</p>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="w-16 h-16 text-green-400" />
            <p className="font-heading font-800 text-xl uppercase tracking-wide text-green-400">Linked Successfully!</p>
            <p className="text-muted-foreground text-sm">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. TC-AB1234"
                className="w-full bg-card border border-border rounded-sm px-4 py-3 text-foreground text-center text-2xl font-heading font-900 tracking-[0.3em] focus:border-primary outline-none transition-colors"
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleJoin}
              disabled={!code.trim() || loading}
              className="w-full bg-primary text-primary-foreground font-heading font-800 text-lg uppercase tracking-widest py-4 rounded-sm hover:bg-amber-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Joining...</> : 'Join Trainer →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}