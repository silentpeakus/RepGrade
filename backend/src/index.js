const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const app = express();
const port = process.env.PORT || 4000;
const POSE_SERVICE_URL = process.env.POSE_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

const upload = multer({ dest: '/tmp/repgrade-uploads/' });

// Forward a video file to the Python pose service and return parsed JSON.
function callPoseService(filePath, filename, exercise) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('video', fs.createReadStream(filePath), { filename: filename || 'video.mp4' });
    form.append('exercise', exercise);

    const url = new URL('/analyze', POSE_SERVICE_URL);
    const options = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      headers: form.getHeaders(),
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          reject(new Error('Invalid JSON from pose service'));
        }
      });
    });
    req.on('error', reject);
    form.pipe(req);
  });
}

// Map the pose service result into the RepGrade response shape.
function buildGradeResponse(exercise, poseResult) {
  const { score_0_to_4, reps = [], issues = [], cues = [] } = poseResult;
  const gpa = typeof score_0_to_4 === 'number' ? score_0_to_4 : null;
  const letterGrade = gpa === null ? 'N/A'
    : gpa >= 3.7 ? 'A'
    : gpa >= 3.0 ? 'B'
    : gpa >= 2.0 ? 'C'
    : gpa >= 1.0 ? 'D' : 'F';

  return {
    exercise,
    gpa: gpa !== null ? Math.round(gpa * 100) / 100 : null,
    grade: letterGrade,
    reps: reps.length,
    cues,
    issues,
    raw: poseResult,
  };
}

app.post('/api/analyze', upload.single('video'), async (req, res) => {
  console.log('POST /api/analyze hit', { file: req.file?.originalname, exercise: req.body?.exercise });
  if (!req.file) {
    console.log('No file received');
    return res.status(400).json({ error: 'No video file uploaded.' });
  }
  const exercise = (req.body.exercise || 'back_squat').trim().toLowerCase().replace(/ /g, '_');

  try {
    const { statusCode, data } = await callPoseService(req.file.path, req.file.originalname, exercise);

    fs.unlink(req.file.path, () => {});

    if (data.status === 'rejected') {
      return res.status(422).json({
        error: 'Video rejected by pre-flight validation.',
        reason: data.reason,
        issues: data.issues,
        view: data.view,
      });
    }

    return res.json(buildGradeResponse(exercise, data));
  } catch (err) {
    fs.unlink(req.file.path, () => {});
    return res.status(502).json({ error: 'Pose service unavailable.', detail: err.message });
  }
});

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

app.listen(port, '0.0.0.0', () => {
  console.log(`Training backend listening on port ${port} (all interfaces)`);
});
