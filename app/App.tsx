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
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

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

export default function App() {
  const [exercise, setExercise] = useState('back_squat');
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [status, setStatus] = useState('Select an exercise, then record or upload a set.');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

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

  async function stopRecording() {
    if (!cameraRef.current) return;
    setRecording(false);
    const video = await cameraRef.current.stopRecording();
    setShowCamera(false);
    if (video?.uri) {
      await analyzeVideo(video.uri, `recording_${Date.now()}.mp4`);
    }
  }

  async function handleRecordPress() {
    if (!recording) {
      setRecording(true);
      cameraRef.current?.recordAsync({ maxDuration: 120 }).then((video) => {
        if (video?.uri) analyzeVideo(video.uri, `recording_${Date.now()}.mp4`);
      });
    } else {
      await stopRecording();
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
              onPress={() => setExercise(opt.id)}
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
      {result && (
        <View style={styles.gradeCard}>
          <View style={styles.gradeHeader}>
            <Text style={styles.gradeLabel}>GRADE</Text>
            <Text style={styles.gradeLetter}>{result.grade}</Text>
            {result.gpa !== null && (
              <Text style={styles.gradeGpa}>{result.gpa.toFixed(2)} GPA</Text>
            )}
          </View>

          <Text style={styles.metaText}>
            {result.reps} rep{result.reps !== 1 ? 's' : ''} detected
          </Text>

          {result.cues.length > 0 && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>COACHING CUES</Text>
              {result.cues.map((cue, i) => (
                <Text key={i} style={styles.bullet}>→ {cue}</Text>
              ))}
            </View>
          )}

          {result.issues.length > 0 && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>FAULTS</Text>
              {result.issues.map((issue, i) => (
                <Text key={i} style={styles.bulletFault}>⚠ {issue}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#121212', minHeight: '100vh' as unknown as number },
  container: { padding: 24, paddingTop: 60, paddingBottom: 48, minHeight: '100vh' as unknown as number },

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
  gradeHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 8 },
  gradeLabel: { fontSize: 10, color: '#888', letterSpacing: 2 },
  gradeLetter: { fontSize: 56, fontWeight: '900', color: '#FFB000', lineHeight: 60 },
  gradeGpa: { fontSize: 16, color: '#FFB000', fontWeight: '700' },
  metaText: { fontSize: 12, color: '#888', marginBottom: 16 },

  subSection: { marginTop: 16 },
  subSectionLabel: { fontSize: 10, color: '#888', letterSpacing: 2, marginBottom: 8 },
  bullet: { fontSize: 13, color: '#DDD', marginBottom: 6 },
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
