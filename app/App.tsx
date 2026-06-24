import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import axios from 'axios';

const BACKEND =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://10.0.0.31:4000';

type AnalysisResult = {
  exercise: string;
  gpa: number | null;
  grade: string;
  reps: number;
  cues: string[];
  issues: string[];
};

type ExerciseOption = {
  id: string;
  label: string;
};

const GRADE_CONTENT: Record<string, { headline: string; strengths: string[] }> = {
  A: {
    headline: 'Elite execution.',
    strengths: ['Your form is textbook — keep training like this.', 'Consistent depth and control throughout every rep.'],
  },
  B: {
    headline: 'Solid set.',
    strengths: ["Good movement pattern — your body knows what it's doing.", 'Strong effort and rep consistency.'],
  },
  C: {
    headline: "You showed up. That's the foundation.",
    strengths: ['You completed the set — consistency builds champions.', 'Your body is learning the movement pattern.'],
  },
  D: {
    headline: 'Every rep is a lesson.',
    strengths: ['You put in the work — that matters most right now.', 'Identifying these patterns early protects you from injury later.'],
  },
  F: {
    headline: 'This is where improvement starts.',
    strengths: ['Knowing what to fix is step one — most people never get here.', 'Every great lifter was once a beginner.'],
  },
};

export default function App() {
  const [exercise, setExercise] = useState('back_squat');
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    axios.get(`${BACKEND}/api/exercises`)
      .then((r) => {
        const opts: ExerciseOption[] = r.data.map((e: { label: string }) => ({
          id: e.label.trim().toLowerCase().replace(/ /g, '_'),
          label: e.label,
        }));
        setExerciseOptions(opts);
        if (opts.length > 0) setExercise(opts[0].id);
      })
      .catch(() => {
        setExerciseOptions([
          { id: 'back_squat', label: 'Back Squat' },
          { id: 'deadlift', label: 'Deadlift' },
          { id: 'bench_press', label: 'Bench Press' },
        ]);
      });
  }, []);

  async function analyzeVideo(uri: string, filename: string) {
    setLoading(true);
    setResult(null);
    setShowDetails(false);
    setStatus('Analyzing your set…');

    const form = new FormData();
    form.append('video', { uri, name: filename, type: 'video/mp4' } as unknown as Blob);
    form.append('exercise', exercise);

    try {
      const r = await axios.post(`${BACKEND}/api/analyze`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      setResult(r.data);
      setStatus('');
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.issues
          ? err.response.data.issues.join(' ')
          : axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Analysis failed. Check that both services are running.';
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  async function pickVideo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setStatus('Camera roll permission denied.'); return; }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });
    if (!picked.canceled && picked.assets[0]) {
      const asset = picked.assets[0];
      await analyzeVideo(asset.uri, asset.uri.split('/').pop() || 'upload.mp4');
    }
  }

  async function handleRecordPress() {
    if (!recording) {
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!micPermission?.granted) await requestMicPermission();
      setRecording(true);
      cameraRef.current?.recordAsync({ maxDuration: 120 }).then((video) => {
        if (video?.uri) analyzeVideo(video.uri, `recording_${Date.now()}.mp4`);
      });
    } else {
      setRecording(false);
      const video = await cameraRef.current?.stopRecording();
      setShowCamera(false);
      if (video?.uri) await analyzeVideo(video.uri, `recording_${Date.now()}.mp4`);
    }
  }

  if (showCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" mode="video" />
        <View style={styles.cameraControls}>
          <Pressable
            style={[styles.recordBtn, recording && styles.recordBtnActive]}
            onPress={handleRecordPress}
          >
            <Text style={styles.recordBtnText}>{recording ? 'STOP' : 'REC'}</Text>
          </Pressable>
          {!recording && (
            <Pressable style={styles.cancelBtn} onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const gradeContent = result ? (GRADE_CONTENT[result.grade] ?? GRADE_CONTENT['C']) : null;
  const topCue = result?.cues?.[0] ?? null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.logoText}>REPGRADE</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLine1}>Record.</Text>
        <Text style={styles.heroLine2}>Get Graded.</Text>
        <Text style={styles.heroLine3}>Get Better.</Text>
        <Text style={styles.heroSub}>AI-POWERED FORM ANALYSIS</Text>
        <Text style={styles.heroBody}>
          Upload a video of your set and receive instant, expert feedback — a letter grade from A to F, detailed form cues, and a lifetime GPA tracking your progress.
        </Text>
      </View>

      {/* Exercise selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SELECT EXERCISE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {exerciseOptions.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.chip, exercise === opt.id && styles.chipActive]}
              onPress={() => { setExercise(opt.id); setResult(null); }}
            >
              <Text style={[styles.chipText, exercise === opt.id && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Capture buttons */}
      <View style={styles.captureRow}>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => { setShowCamera(true); }}
          disabled={loading}
        >
          <Text style={styles.primaryBtnIcon}>🎥</Text>
          <Text style={styles.primaryBtnText}>Record Your Set</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={pickVideo} disabled={loading}>
          <Text style={styles.secondaryBtnText}>Upload Video</Text>
        </Pressable>
      </View>

      {/* Loading state */}
      {loading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#00C6B8" size="large" />
          <Text style={styles.loadingTitle}>Analyzing your set…</Text>
          <Text style={styles.loadingBody}>Our AI is reviewing your form, tempo, and intensity. This takes 1–2 minutes.</Text>
        </View>
      )}

      {/* Error state */}
      {!loading && status !== '' && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{status}</Text>
        </View>
      )}

      {/* Results */}
      {result && gradeContent && (
        <View style={styles.resultsCard}>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>OVERALL GPA</Text>
              <Text style={styles.statValue}>{result.gpa !== null ? result.gpa.toFixed(1) : '—'}</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxAccent]}>
              <Text style={[styles.statLabel, { color: '#00C6B8' }]}>CURRENT GRADE</Text>
              <Text style={[styles.statValue, { color: '#00C6B8' }]}>{result.grade}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>REPS</Text>
              <Text style={styles.statValue}>{result.reps}</Text>
            </View>
          </View>

          {/* Headline */}
          <Text style={styles.resultHeadline}>{gradeContent.headline}</Text>

          {/* Strengths */}
          <View style={styles.resultSection}>
            <Text style={styles.resultSectionLabel}>WHAT YOU DID WELL</Text>
            {gradeContent.strengths.map((s, i) => (
              <View key={i} style={styles.strengthRow}>
                <View style={styles.strengthDot} />
                <Text style={styles.strengthText}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Focus cue */}
          {topCue && (
            <View style={styles.focusCard}>
              <Text style={styles.focusLabel}>FOCUS ON THIS NEXT SET</Text>
              <Text style={styles.focusText}>{topCue}</Text>
            </View>
          )}

          {/* Details toggle */}
          {(result.cues.length > 1 || result.issues.length > 0) && (
            <>
              <Pressable style={styles.detailsToggle} onPress={() => setShowDetails(!showDetails)}>
                <Text style={styles.detailsToggleText}>
                  {showDetails ? 'Hide Full Breakdown ↑' : 'See Full Breakdown ↓'}
                </Text>
              </Pressable>

              {showDetails && (
                <View style={styles.detailsBody}>
                  {result.cues.length > 1 && (
                    <>
                      <Text style={styles.resultSectionLabel}>ALL COACHING CUES</Text>
                      {result.cues.map((cue, i) => (
                        <Text key={i} style={styles.detailItem}>→ {cue}</Text>
                      ))}
                    </>
                  )}
                  {result.issues.length > 0 && (
                    <>
                      <Text style={[styles.resultSectionLabel, { marginTop: 16 }]}>FAULTS DETECTED</Text>
                      {result.issues.map((issue, i) => (
                        <Text key={i} style={styles.faultItem}>⚠ {issue}</Text>
                      ))}
                    </>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* How it works */}
      {!result && !loading && (
        <View style={styles.howItWorks}>
          <Text style={styles.howTitle}>Three steps to better form</Text>
          <Text style={styles.howSubtitle}>No guesswork. No waiting. Just instant, actionable feedback every single rep.</Text>
          <View style={styles.stepsRow}>
            {[
              { n: '01', icon: '🎥', title: 'Record Your Set', body: 'Film yourself completing a set — squat, bench, deadlift, or any exercise. Upload or record directly in the app.' },
              { n: '02', icon: '⚡', title: 'Get Graded Instantly', body: 'Our AI analyzes your form, tempo, and intensity. You receive a letter grade A–F within seconds.' },
              { n: '03', icon: '📈', title: 'Track Your Progress', body: 'Every session is saved. Watch your GPA rise over time and get notified when you\'re ready to increase the weight.' },
            ].map((step) => (
              <View key={step.n} style={styles.stepCard}>
                <Text style={styles.stepNumber}>{step.n}</Text>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F0F2F5' },
  container: { paddingBottom: 60 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 18 },
  logoText: { fontSize: 18, fontWeight: '900', color: '#0D0D1A', letterSpacing: 2 },

  hero: { paddingHorizontal: 24, paddingBottom: 36 },
  heroLine1: { fontSize: 52, fontWeight: '900', color: '#0D0D1A', lineHeight: 58 },
  heroLine2: { fontSize: 52, fontWeight: '900', color: '#00C6B8', lineHeight: 58 },
  heroLine3: { fontSize: 52, fontWeight: '900', color: '#0D0D1A', lineHeight: 58, marginBottom: 20 },
  heroSub: { fontSize: 11, color: '#888', letterSpacing: 3, marginBottom: 12 },
  heroBody: { fontSize: 15, color: '#555', lineHeight: 24 },

  section: { paddingHorizontal: 24, marginBottom: 20 },
  sectionLabel: { fontSize: 10, color: '#888', letterSpacing: 2, marginBottom: 12, fontWeight: '700' },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActive: { backgroundColor: '#0D0D1A', borderColor: '#0D0D1A' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },

  captureRow: { paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D1A',
    paddingVertical: 16,
    borderRadius: 100,
    gap: 8,
  },
  primaryBtnIcon: { fontSize: 16 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: '#0D0D1A' },

  loadingCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingTitle: { fontSize: 17, fontWeight: '700', color: '#0D0D1A', marginTop: 8 },
  loadingBody: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },

  errorCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    padding: 16,
  },
  errorText: { fontSize: 13, color: '#CC3333' },

  resultsCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 14,
  },
  statBoxAccent: { backgroundColor: '#E6FFFE' },
  statLabel: { fontSize: 9, color: '#888', letterSpacing: 1.5, fontWeight: '700', marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#0D0D1A' },

  resultHeadline: { fontSize: 22, fontWeight: '800', color: '#0D0D1A', marginBottom: 20 },

  resultSection: { marginBottom: 20 },
  resultSectionLabel: { fontSize: 10, color: '#888', letterSpacing: 2, fontWeight: '700', marginBottom: 12 },

  strengthRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  strengthDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C6B8', marginTop: 5 },
  strengthText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 22 },

  focusCard: {
    backgroundColor: '#E6FFFE',
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#00C6B8',
    marginBottom: 20,
  },
  focusLabel: { fontSize: 10, color: '#00A89C', letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  focusText: { fontSize: 15, color: '#0D0D1A', fontWeight: '600', lineHeight: 22 },

  detailsToggle: { alignItems: 'center', paddingVertical: 12 },
  detailsToggleText: { fontSize: 13, color: '#00C6B8', fontWeight: '700' },
  detailsBody: { paddingTop: 8 },
  detailItem: { fontSize: 13, color: '#555', marginBottom: 8, lineHeight: 20 },
  faultItem: { fontSize: 13, color: '#CC3333', marginBottom: 8, lineHeight: 20 },

  howItWorks: { paddingHorizontal: 24, paddingTop: 40 },
  howTitle: { fontSize: 28, fontWeight: '800', color: '#0D0D1A', marginBottom: 12, textAlign: 'center' },
  howSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  stepsRow: { gap: 14 },
  stepCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  stepNumber: { fontSize: 36, fontWeight: '900', color: '#E8E8E8', position: 'absolute', right: 22, top: 18 },
  stepIcon: { fontSize: 28, marginBottom: 12 },
  stepTitle: { fontSize: 17, fontWeight: '800', color: '#0D0D1A', marginBottom: 8 },
  stepBody: { fontSize: 14, color: '#777', lineHeight: 22 },

  cameraControls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
  },
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#00C6B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: { backgroundColor: '#FF3B30' },
  recordBtnText: { fontSize: 11, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  cancelBtn: { paddingVertical: 10 },
  cancelBtnText: { color: '#FFF', fontSize: 14 },
});
