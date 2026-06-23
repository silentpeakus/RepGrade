const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const rubric = {
  A: 'Excellent form, timing, and control.',
  B: 'Good performance with minor adjustments needed.',
  C: 'Acceptable technique but several areas need improvement.',
  D: 'Poor form with higher risk and multiple issues.',
  F: 'Unsafe set or too many technical faults.'
};

const exerciseLibrary = {
  squat: {
    label: 'Squat',
    keyCues: [
      'Keep knees tracking over toes',
      'Sit back into your heels',
      'Maintain a tall chest and neutral spine'
    ],
    example:
      'Stand feet shoulder-width apart, hinge at hips, lower hips until thighs are parallel, and drive back up through the heels.'
  },
  deadlift: {
    label: 'Deadlift',
    keyCues: [
      'Hinge from the hips instead of rounding the lower back',
      'Keep the bar close to the shins',
      'Finish tall with hips and shoulders aligned'
    ],
    example:
      'Start with the bar over mid-foot, grip tight, lift by extending hips and knees together, then lower with control.'
  },
  bench: {
    label: 'Bench Press',
    keyCues: [
      'Keep shoulder blades squeezed together',
      'Feet planted on the floor',
      'Lower to mid-chest and press evenly'
    ],
    example:
      'Lie on the bench, grip slightly wider than shoulder width, lower the bar to the chest, and press back up until arms lock out.'
  }
};

function getExerciseInfo(exercise) {
  if (!exercise) return null;
  const key = String(exercise).trim().toLowerCase();
  return exerciseLibrary[key] || null;
}

function gradeExercise({ exercise, metrics }) {
  if (!metrics) return { grade: 'D', summary: rubric.D };

  const score = metrics.score;
  if (score >= 90) return { grade: 'A', summary: rubric.A };
  if (score >= 80) return { grade: 'B', summary: rubric.B };
  if (score >= 70) return { grade: 'C', summary: rubric.C };
  if (score >= 60) return { grade: 'D', summary: rubric.D };
  return { grade: 'F', summary: rubric.F };
}

function generateAdvice(exercise, score) {
  const info = getExerciseInfo(exercise);
  if (!info) {
    return {
      strengths: ['Good effort and consistency'],
      improvements: ['Focus on basic form cues for the movement type']
    };
  }

  const strengths = [];
  const improvements = [];

  if (score >= 85) {
    strengths.push(`Strong control in ${info.label}.`);
    strengths.push('Stable positioning and consistent tempo.');
  } else if (score >= 70) {
    strengths.push(`Solid effort on ${info.label}.`);
    strengths.push('Good movement awareness.');
  } else {
    strengths.push(`Working through ${info.label}.`);
    strengths.push('Beginning to build better muscle coordination.');
  }

  if (score >= 90) {
    improvements.push('Keep reinforcing the current technique.');
  } else if (score >= 80) {
    improvements.push(`Fine-tune the key cues for ${info.label}.`);
    improvements.push('Maintain a steady tempo through each rep.');
  } else if (score >= 60) {
    improvements.push('Slow down and focus on your setup position.');
    improvements.push(`Use the exercise cues to improve alignment in ${info.label}.`);
  } else {
    improvements.push('Review the basic movement pattern before increasing load.');
    improvements.push(`Use the key cues consistently for ${info.label}.`);
  }

  return { strengths, improvements };
}

app.get('/api/exercises', (req, res) => {
  const exercises = Object.values(exerciseLibrary).map((exercise) => ({
    label: exercise.label,
    keyCues: exercise.keyCues,
    example: exercise.example
  }));
  res.json(exercises);
});

app.post('/api/report-card', (req, res) => {
  const { exercise, score } = req.body;

  if (!exercise || typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 100) {
    return res.status(400).json({ error: 'Request must include an exercise string and score number between 0 and 100.' });
  }

  const result = gradeExercise({
    exercise,
    metrics: { score }
  });

  const exerciseInfo = getExerciseInfo(exercise);
  const advice = generateAdvice(exercise, score);

  res.json({
    exercise,
    score,
    grade: result.grade,
    summary: result.summary,
    example:
      (exerciseInfo && exerciseInfo.example) ||
      'Use safe, controlled movement patterns and maintain good form throughout each rep.',
    keyCues:
      (exerciseInfo && exerciseInfo.keyCues) ||
      ['Stay balanced', 'Move through a full range of motion', 'Control each rep'],
    strengths: advice.strengths,
    improvements: advice.improvements
  });
});

app.listen(port, () => {
  console.log(`Training backend listening at http://localhost:${port}`);
});
