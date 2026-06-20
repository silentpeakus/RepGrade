import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Video, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EXERCISES = {
  chest: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Fly', 'Cable Crossover', 'Push-Up', 'Chest Dip'],
  back: ['Deadlift', 'Bent-Over Row', 'Pull-Up', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row', 'Face Pull'],
  shoulders: ['Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Shrug'],
  arms: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crusher', 'Close-Grip Bench Press', 'Preacher Curl'],
  legs: ['Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift', 'Stiff-Leg Deadlift', 'Good Morning', 'Leg Extension', 'Leg Curl'],
  glutes: ['Hip Thrust', 'Bulgarian Split Squat', 'Sumo Deadlift', 'Glute Kickback', 'Cable Pull Through'],
  core: ['Plank', 'Ab Wheel Rollout', 'Cable Crunch', 'Hanging Leg Raise', 'Russian Twist'],
  full_body: ['Clean', 'Power Clean', 'Snatch', 'Thruster', 'Kettlebell Swing'],
};

const ALL_EXERCISES = Object.entries(EXERCISES).flatMap(([cat, exercises]) =>
  exercises.map(ex => ({ name: ex, category: cat }))
);

export default function SubmitSet() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('upload'); // 'upload' | 'live'
  const [videoFile, setVideoFile] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const filteredExercises = ALL_EXERCISES.filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedExercise) return;
    setLoading(true);

    const user = await base44.auth.me();

    let videoUrl = null;
    if (videoFile) {
      const uploadRes = await base44.integrations.Core.UploadFile({ file: videoFile });
      videoUrl = uploadRes.file_url;
    }

    // AI Analysis
    const prompt = `You are a professional bodybuilding coach AI. Analyze the described exercise and generate realistic performance scores.

Exercise: ${selectedExercise.name}
Category: ${selectedExercise.category}
Reps: ${reps || 'unknown'}
Weight: ${weight || 'unknown'} lbs
${videoUrl ? 'Video was uploaded for analysis.' : 'No video provided — generate plausible demo scores.'}

Return JSON with these exact fields:
- form_score: number 0-100 (technique quality)
- intensity_score: number 0-100 (effort level)  
- tempo_score: number 0-100 (controlled, consistent pace)
- overall_grade: number 0-100 (weighted average, form weighs most)
- grade_letter: string (A+, A, A-, B+, B, B-, C+, C, C-, D, or F)
- feedback: string (2-3 sentences of specific, actionable coaching feedback)
- ready_to_progress: boolean (true if overall_grade >= 85)`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          form_score: { type: 'number' },
          intensity_score: { type: 'number' },
          tempo_score: { type: 'number' },
          overall_grade: { type: 'number' },
          grade_letter: { type: 'string' },
          feedback: { type: 'string' },
          ready_to_progress: { type: 'boolean' },
        },
      },
    });

    const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
    const trainerId = profiles[0]?.linked_trainer_id || null;

    await base44.entities.GradeSession.create({
      athlete_id: user.id,
      trainer_id: trainerId,
      exercise: selectedExercise.name,
      exercise_category: selectedExercise.category,
      video_url: videoUrl,
      form_score: analysis.form_score,
      intensity_score: analysis.intensity_score,
      tempo_score: analysis.tempo_score,
      overall_grade: analysis.overall_grade,
      grade_letter: analysis.grade_letter,
      feedback: analysis.feedback,
      ready_to_progress: analysis.ready_to_progress,
      reps: reps ? parseInt(reps) : null,
      weight_lbs: weight ? parseFloat(weight) : null,
      session_date: new Date().toISOString().split('T')[0],
      status: 'completed',
    });

    setLoading(false);
    navigate('/history');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-heading font-600 mb-1">New Session</p>
        <h1 className="font-heading font-900 text-4xl uppercase tracking-wide text-foreground">Submit Set</h1>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-3 p-4 border-2 rounded-sm transition-all ${
            mode === 'upload' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/40'
          }`}
        >
          <Upload className="w-5 h-5" />
          <span className="font-heading font-700 uppercase text-sm tracking-wide">Upload Video</span>
        </button>
        <button
          onClick={() => setMode('live')}
          className={`flex items-center gap-3 p-4 border-2 rounded-sm transition-all ${
            mode === 'live' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/40'
          }`}
        >
          <Video className="w-5 h-5" />
          <span className="font-heading font-700 uppercase text-sm tracking-wide">Record Live</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Exercise selector */}
        <div>
          <label className="block text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground mb-2">
            Exercise *
          </label>
          <div className="relative">
            <button
              onClick={() => setShowExerciseList(!showExerciseList)}
              className="w-full flex items-center justify-between bg-card border border-border rounded-sm px-4 py-3 text-left hover:border-primary/40 transition-colors"
            >
              <span className={selectedExercise ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                {selectedExercise ? selectedExercise.name : 'Select an exercise...'}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {showExerciseList && (
              <div className="absolute top-full left-0 right-0 z-20 bg-card border border-border rounded-sm mt-1 max-h-64 overflow-y-auto shadow-xl">
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={exerciseSearch}
                    onChange={e => setExerciseSearch(e.target.value)}
                    className="w-full bg-background text-foreground text-sm px-3 py-2 rounded-sm border border-border outline-none focus:border-primary"
                    autoFocus
                  />
                </div>
                {filteredExercises.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => { setSelectedExercise(ex); setShowExerciseList(false); setExerciseSearch(''); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-left"
                  >
                    <span>{ex.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{ex.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reps & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground mb-2">
              Reps
            </label>
            <input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value)}
              placeholder="e.g. 8"
              className="w-full bg-card border border-border rounded-sm px-4 py-3 text-foreground focus:border-primary outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground mb-2">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 185"
              className="w-full bg-card border border-border rounded-sm px-4 py-3 text-foreground focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>

        {/* Video */}
        {mode === 'upload' && (
          <div>
            <label className="block text-xs font-heading font-700 uppercase tracking-widest text-muted-foreground mb-2">
              Video File
            </label>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-primary/40 transition-colors bg-card group">
              {videoFile ? (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">{videoFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">MP4, MOV up to 500MB</span>
                </>
              )}
              <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}

        {mode === 'live' && (
          <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-primary/30 rounded-sm bg-primary/5">
            <Video className="w-8 h-8 text-primary mb-2" />
            <span className="text-sm text-primary font-heading font-700 uppercase tracking-wide">Live Recording Mode</span>
            <span className="text-xs text-muted-foreground mt-1">Camera access required — available in mobile app</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedExercise || loading}
          className="w-full bg-primary text-primary-foreground font-heading font-800 text-lg uppercase tracking-widest py-4 rounded-sm hover:bg-amber-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Set...
            </>
          ) : (
            'Get My Grade →'
          )}
        </button>
      </div>
    </div>
  );
}