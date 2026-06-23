import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { colors } from '../theme';

const EXERCISES: Record<string, string[]> = {
  chest: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Fly', 'Cable Crossover', 'Push-Up', 'Chest Dip'],
  back: ['Deadlift', 'Bent-Over Row', 'Pull-Up', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row', 'Face Pull'],
  shoulders: ['Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Shrug'],
  arms: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crusher', 'Close-Grip Bench Press', 'Preacher Curl'],
  legs: ['Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift', 'Stiff-Leg Deadlift', 'Leg Extension', 'Leg Curl'],
  glutes: ['Hip Thrust', 'Bulgarian Split Squat', 'Sumo Deadlift', 'Glute Kickback', 'Cable Pull Through'],
  core: ['Plank', 'Ab Wheel Rollout', 'Cable Crunch', 'Hanging Leg Raise', 'Russian Twist'],
  full_body: ['Clean', 'Power Clean', 'Snatch', 'Thruster', 'Kettlebell Swing'],
};

const ALL_EXERCISES = Object.entries(EXERCISES).flatMap(([cat, exercises]) =>
  exercises.map(ex => ({ name: ex, category: cat }))
);

interface Props {
  onSubmit: (exercise: string, category: string, reps: string, weight: string) => Promise<void>;
}

export default function SubmitSetScreen({ onSubmit }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; category: string } | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = ALL_EXERCISES.filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedExercise) return;
    setLoading(true);
    try {
      await onSubmit(selectedExercise.name, selectedExercise.category, reps, weight);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>New Session</Text>
      <Text style={styles.title}>Submit Set</Text>

      {/* Exercise Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Exercise *</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowExercisePicker(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.selectorText, !selectedExercise && { color: colors.mutedForeground }]}>
            {selectedExercise ? selectedExercise.name : 'Select an exercise...'}
          </Text>
          <Text style={{ color: colors.mutedForeground }}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* Reps & Weight */}
      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            placeholder="e.g. 8"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
          />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 185"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Video placeholder */}
      <View style={styles.field}>
        <Text style={styles.label}>Video</Text>
        <View style={styles.videoBox}>
          <Text style={styles.videoIcon}>🎥</Text>
          <Text style={styles.videoTitle}>Record Live</Text>
          <Text style={styles.videoSub}>Camera grading coming soon</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, (!selectedExercise || loading) && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!selectedExercise || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.submitRow}>
            <ActivityIndicator color={colors.primaryForeground} size="small" />
            <Text style={styles.submitText}>  Analyzing Set...</Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Get My Grade →</Text>
        )}
      </TouchableOpacity>

      {/* Exercise picker modal */}
      <Modal visible={showExercisePicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            value={exerciseSearch}
            onChangeText={setExerciseSearch}
            placeholder="Search exercises..."
            placeholderTextColor={colors.mutedForeground}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => {
                  setSelectedExercise(item);
                  setShowExercisePicker(false);
                  setExerciseSearch('');
                }}
              >
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseCategory}>{item.category}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  eyebrow: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: colors.foreground,
    fontSize: 36,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 24,
  },
  field: { marginBottom: 20 },
  label: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  selector: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: { color: colors.foreground, fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.foreground,
    fontSize: 15,
  },
  videoBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 4,
    backgroundColor: 'rgba(245,158,11,0.05)',
    paddingVertical: 32,
    alignItems: 'center',
  },
  videoIcon: { fontSize: 28, marginBottom: 8 },
  videoTitle: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  videoSub: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.4 },
  submitRow: { flexDirection: 'row', alignItems: 'center' },
  submitText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalClose: { color: colors.mutedForeground, fontSize: 20 },
  searchInput: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: colors.foreground,
    fontSize: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  exerciseName: { color: colors.foreground, fontSize: 15 },
  exerciseCategory: {
    color: colors.mutedForeground,
    fontSize: 11,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
});
