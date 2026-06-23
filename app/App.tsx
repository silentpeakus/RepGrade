import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  Platform,
  TextInput
} from 'react-native';
import axios from 'axios';

export default function App() {
  const [exercise, setExercise] = useState('squat');
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [scoreText, setScoreText] = useState('82');
  const [status, setStatus] = useState('Ready to submit a set');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  const backendHost = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setOptionsLoading(true);
        const response = await axios.get(`${backendHost}/api/exercises`);
        const exercises = response.data.map((item) => ({
          ...item,
          id: item.id || item.label.trim().toLowerCase()
        }));
        setExerciseOptions(exercises);
        if (exercises.length > 0) {
          setExercise(exercises[0].id);
        }
      } catch (error) {
        setOptionsError('Unable to load exercise library.');
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchExercises();
  }, [backendHost]);

  const handleSubmit = async () => {
    const score = Number(scoreText.trim());
    if (!exercise.trim() || Number.isNaN(score) || score < 0 || score > 100) {
      setStatus('Enter a valid exercise name and score 0–100.');
      return;
    }

    setLoading(true);
    setStatus('Submitting workout...');
    setResult(null);

    try {
      const response = await axios.post(`${backendHost}/api/report-card`, {
        exercise,
        score
      });

      setResult(response.data);
      setStatus('Workout reviewed successfully.');
    } catch (error) {
      setStatus('Upload failed. Check backend and network.');
    } finally {
      setLoading(false);
    }
  };

  const normalizedExercise = exercise.trim().toLowerCase();
  const selectedExercise =
    exerciseOptions.find((item) => item.id === normalizedExercise) ||
    exerciseOptions.find((item) => item.label.toLowerCase() === normalizedExercise);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Training AI</Text>
      <Text style={styles.subtitle}>Submit a workout set for review</Text>

      {optionsLoading ? (
        <View style={styles.card}>
          <Text style={styles.label}>Loading exercises…</Text>
          <ActivityIndicator style={styles.spinner} />
        </View>
      ) : optionsError ? (
        <View style={styles.card}>
          <Text style={styles.label}>{optionsError}</Text>
        </View>
      ) : (
        <View style={styles.exerciseSelector}>
          {exerciseOptions.map((item) => (
            <View style={styles.exerciseButton} key={item.id}>
              <Button
                title={item.label}
                onPress={() => {
                  setExercise(item.id);
                  setStatus(`Selected ${item.label}.`);
                }}
              />
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Exercise</Text>
        <TextInput
          style={styles.input}
          value={exercise}
          onChangeText={setExercise}
          placeholder="e.g. squat"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Performance Score</Text>
        <TextInput
          style={styles.input}
          value={scoreText}
          onChangeText={setScoreText}
          placeholder="0 - 100"
          keyboardType="numeric"
        />
      </View>

      {selectedExercise && (
        <View style={styles.card}>
          <Text style={styles.label}>Exercise Cues</Text>
          {selectedExercise.keyCues.map((cue, index) => (
            <Text key={`cue-${index}`} style={styles.detailBullet}>
              • {cue}
            </Text>
          ))}
          <Text style={[styles.label, styles.exampleLabel]}>Example</Text>
          <Text>{selectedExercise.example}</Text>
        </View>
      )}

      <Button title="Submit Workout" onPress={handleSubmit} disabled={loading} />
      {loading && <ActivityIndicator style={styles.spinner} />}

      <View style={styles.resultCard}>
        <Text style={styles.label}>Status</Text>
        <Text>{status}</Text>
        {result && (
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Grade: {result.grade}</Text>
            <Text>{result.summary}</Text>

            {result.example && (
              <>
                <Text style={styles.detailSubtitle}>Exercise Example</Text>
                <Text>{result.example}</Text>
              </>
            )}

            {result.keyCues && (
              <>
                <Text style={styles.detailSubtitle}>Key Cues</Text>
                {result.keyCues.map((item, index) => (
                  <Text key={`result-cue-${index}`} style={styles.detailBullet}>
                    • {item}
                  </Text>
                ))}
              </>
            )}

            <Text style={styles.detailSubtitle}>Strengths</Text>
            {result.strengths.map((item, index) => (
              <Text key={`strength-${index}`} style={styles.detailBullet}>• {item}</Text>
            ))}
            <Text style={styles.detailSubtitle}>Improvements</Text>
            {result.improvements.map((item, index) => (
              <Text key={`improve-${index}`} style={styles.detailBullet}>• {item}</Text>
            ))}
          </View>
        )}
      </View>

      <StatusBar style={Platform.OS === 'web' ? 'dark' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  input: {
    width: '100%',
    padding: 12,
    marginTop: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#fff'
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    color: '#333'
  },
  spinner: {
    marginTop: 12
  },
  resultCard: {
    width: '100%',
    maxWidth: 420,
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#eef2ff'
  },
  detailSection: {
    marginTop: 12
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6
  },
  detailSubtitle: {
    marginTop: 12,
    fontWeight: '700'
  },
  detailBullet: {
    marginLeft: 12,
    marginTop: 4
  },
  exerciseSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    marginBottom: 18
  },
  exerciseButton: {
    flex: 1,
    marginHorizontal: 4
  },
  exampleLabel: {
    marginTop: 12
  }
});
