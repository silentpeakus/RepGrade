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
    strengths: ['Good movement pattern — your body knows what it\'s doing.', 'Strong effort and rep consistency.'],
  },
  C: {
    headline: 'You showed up. That\'s the foundation.',
    strengths: ['You completed the set — consistency builds champions.', 'Your body is learning the movement pattern.'],
  },
  D: {
    headline: 'Every rep is a lesson.',
    strengths: ['You put in the work — that\'s what matters most right now.', 'Identifying these patterns early protects you from injury later.'],
  },
  F: {
    headline: 'This is where improvement starts.',
    strengths: ['Knowing what to fix is step one — most people never get here.', 'Every great lifter was once a beginner.'],
  },
};

export default function App() {
  const [exercise, setExercise] = useState('back_squat');
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [status, setStatus] = useState('Select an exercise, then record or upload a set.');
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
    setStatus('Analyzing set… this takes 1–2 minutes.');

    const form = new FormData();
    form.append('video', { uri, name: filename, type: 'video/mp4' } as unknown as Blob);
    form.append('exercise', exercise);

    try {
      const r = await axios.post(`${BACKEND}/api/analyze`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      setResult(r.data);
      setStatus('Analysis complete.');
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
    if (!perm.granted) {
      setStatus('Camera roll permission denied.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });
    if (!picked.canceled && picked.assets[0]) {
      const asset = picked.assets[0];
      const filename = asset.uri.split('/').pop() || 'upload.mp4';
      await analyzeVideo(asset.uri, filename);
    }
  }

  async function startRecording() {
    if (!cameraPermission?.granted) await requestCameraPermission();
    if (!micPermission?.granted) await requestMicPermission();
    setShowCamera(true);
  }

  async function handleRecordPress() {
    if (!recording) {
      setRecording(true);
      cameraRef.current?.recordAsync({ maxDuration: 120 }).then((video) => {
        if (video?.uri) analyzeVideo(video.uri, `recording_${Date.now()}.mp4`);
      });
    } else {
      setRecording(false);
      const video = await cameraRef.current?.stopRecording();
      setShowCamera(false);
      if (video?.uri) {
        await analyzeVideo(video.uri, `recording_${Date.now()}.mp4`);
      }
    }
  }

  if (showCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" mode="video" />
        <View style={styles.cameraControls}>
          <Pressable
            style={[styles.recordBtn, recording && styles.recordBtnActive]}
            onPress={handleRecordPress}
          >
            <Text style={styles.recordBtnText}>{recording ? 'STOP' : 'RECORD'}</Text>
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
      <Text style={styles.title}>REPGRADE</Text>
      <Text style={styles.subtitle}>Performance Intelligence</Text>

      {/* Exercise selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>EXERCISE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {exerciseOptions.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.chip, exercise === opt.id && styles.chipActive]}
              onPress={() => { setExercise(opt.id); setResult(null); }}
            >
              <Text style={[styles.chipText, exercise === opt.id && styles.chipTextActive]}>
                {opt.label.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Capture actions */}
      <View style={styles.captureRow}>
        <Pressable style={styles.actionBtn} onPress={startRecording} disabled={loading}>
          <Text style={styles.actionBtnText}>RECORD SET</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={pickVideo} disabled={loading}>
          <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>UPLOAD VIDEO</Text>
        </Pressable>
      </View>

      {/* Status / loading */}
      <View style={styles.statusBar}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#FFB000" />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>{status}</Text>
        )}
      </View>

      {/* Grade output */}
      {result && gradeContent && (
        <View style={styles.gradeCard}>

          {/* Grade + headline */}
          <View style={styles.gradeHeader}>
            <Text style={styles.gradeLetter}>{result.grade}</Text>
            <View style={styles.gradeHeaderRight}>
              {result.gpa !== null && (
                <Text style={styles.gradeGpa}>{result.gpa.toFixed(2)} GPA</Text>
              )}
              <Text style={styles.repsText}>
                {result.reps} rep{result.reps !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Text style={styles.headline}>{gradeContent.headline}</Text>

          <View style={styles.divider} />

          {/* Strengths */}
          <Text style={styles.subSectionLabel}>WHAT YOU DID WELL</Text>
          {gradeContent.strengths.map((s, i) => (
            <Text key={i} style={styles.strengthText}>✓ {s}</Text>
          ))}

          {/* Single focus cue */}
          {topCue && (
            <>
              <View style={styles.divider} />
              <Text style={styles.subSectionLabel}>FOCUS ON THIS NEXT SET</Text>
              <View style={styles.focusCueBox}>
                <Text style={styles.focusCueText}>{topCue}</Text>
              </View>
            </>
          )}

          {/* See details toggle */}
          {(result.cues.length > 1 || result.issues.length > 0) && (
            <>
              <Pressable style={styles.detailsToggle} onPress={() => setShowDetails(!showDetails)}>
                <Text style={styles.detailsToggleText}>
                  {showDetails ? 'HIDE DETAILS ↑' : 'SEE FULL BREAKDOWN ↓'}
                </Text>
              </Pressable>

              {showDetails && (
                <View style={styles.detailsSection}>
                  {result.cues.length > 1 && (
                    <>
                      <Text style={styles.subSectionLabel}>ALL COACHING CUES</Text>
                      {result.cues.map((cue, i) => (
                        <Text key={i} style={styles.bullet}>→ {cue}</Text>
                      ))}
                    </>
                  )}
                  {result.issues.length > 0 && (
                    <>
                      <Text style={[styles.subSectionLabel, { marginTop: 16 }]}>FAULTS DETECTED</Text>
                      {result.issues.map((issue, i) => (
                        <Text key={i} style={styles.bulletFault}>⚠ {issue}</Text>
                      ))}
                    </>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      )}

      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#121212' },
  container: { padding: 24, paddingTop: 60, paddingBottom: 48 },

  title: { fontSize: 32, fontWeight: '900', color: '#FFB000', letterSpacing: 4 },
  subtitle: { fontSize: 12, color: '#888', letterSpacing: 3, marginBottom: 36, marginTop: 4 },

  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 10, color: '#888', letterSpacing: 2, marginBottom: 10 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    backgroundColor: '#1E1E1E',
  },
  chipActive: { borderColor: '#FFB000', backgroundColor: '#2A2200' },
  chipText: { fontSize: 11, color: '#888', fontWeight: '700', letterSpacing: 1 },
  chipTextActive: { color: '#FFB000' },

  captureRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#FFB000',
    alignItems: 'center',
  },
  actionBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFB000' },
  actionBtnText: { fontSize: 12, fontWeight: '900', color: '#121212', letterSpacing: 2 },
  actionBtnTextSecondary: { color: '#FFB000' },

  statusBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
    marginBottom: 24,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { fontSize: 12, color: '#888', flex: 1 },

  gradeCard: { backgroundColor: '#1E1E1E', padding: 24 },

  gradeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  gradeLetter: { fontSize: 72, fontWeight: '900', color: '#FFB000', lineHeight: 76 },
  gradeHeaderRight: { alignItems: 'flex-end' },
  gradeGpa: { fontSize: 20, color: '#FFB000', fontWeight: '700' },
  repsText: { fontSize: 12, color: '#888', marginTop: 4 },

  headline: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 20 },

  divider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 20 },

  strengthText: { fontSize: 14, color: '#BBB', marginBottom: 8, lineHeight: 20 },

  focusCueBox: {
    marginTop: 10,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB000',
    backgroundColor: '#2A2200',
  },
  focusCueText: { fontSize: 14, color: '#FFB000', fontWeight: '600', lineHeight: 20 },

  detailsToggle: { marginTop: 20, alignItems: 'center', paddingVertical: 12 },
  detailsToggleText: { fontSize: 10, color: '#555', letterSpacing: 2, fontWeight: '700' },

  detailsSection: { marginTop: 8 },
  bullet: { fontSize: 13, color: '#AAA', marginBottom: 6 },
  bulletFault: { fontSize: 13, color: '#FF6B35', marginBottom: 6 },

  cameraControls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFB000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: { backgroundColor: '#FF3B30' },
  recordBtnText: { fontSize: 11, fontWeight: '900', color: '#121212', letterSpacing: 1 },
  cancelBtn: { paddingVertical: 10 },
  cancelBtnText: { color: '#888', fontSize: 14 },
});
