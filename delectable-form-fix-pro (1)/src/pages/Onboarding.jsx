import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Dumbbell, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Onboarding() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!role) return;
    setLoading(true);
    const user = await base44.auth.me();
    const trainerCode = role === 'trainer' ? `TC-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : null;
    await base44.entities.UserProfile.create({
      user_id: user.id,
      role,
      trainer_code: trainerCode,
      total_sessions: 0,
    });
    navigate(role === 'trainer' ? '/trainer' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-heading font-900 text-3xl uppercase tracking-wider text-foreground">RepGrade</span>
        </div>

        <h1 className="font-heading font-900 text-4xl uppercase tracking-wide text-foreground text-center mb-2">
          Who Are You?
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">Choose your role to get the right experience.</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Athlete */}
          <button
            onClick={() => setRole('athlete')}
            className={`flex flex-col items-center gap-4 p-6 border-2 rounded-sm transition-all ${
              role === 'athlete'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <Dumbbell className="w-10 h-10" />
            <div className="text-center">
              <p className="font-heading font-800 text-lg uppercase tracking-wide">Athlete</p>
              <p className="text-xs mt-1 leading-snug">Track your lifts & grade your form</p>
            </div>
          </button>

          {/* Trainer */}
          <button
            onClick={() => setRole('trainer')}
            className={`flex flex-col items-center gap-4 p-6 border-2 rounded-sm transition-all ${
              role === 'trainer'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <Users className="w-10 h-10" />
            <div className="text-center">
              <p className="font-heading font-800 text-lg uppercase tracking-wide">Trainer</p>
              <p className="text-xs mt-1 leading-snug">Monitor your clients' progress</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!role || loading}
          className="w-full bg-primary text-primary-foreground font-heading font-800 text-lg uppercase tracking-widest py-4 rounded-sm hover:bg-amber-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting up...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}