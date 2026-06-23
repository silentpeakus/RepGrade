import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { colors } from '../theme';
import GradeCard from '../components/GradeCard';

const CATEGORIES = ['All', 'chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'full_body'];

interface Session {
  id: string;
  exercise: string;
  exercise_category?: string;
  session_date: string;
  weight_lbs?: number;
  reps?: number;
  grade_letter?: string;
  form_score?: number;
  intensity_score?: number;
  tempo_score?: number;
  overall_grade?: number;
  ready_to_progress?: boolean;
  feedback?: string;
}

interface Props {
  sessions: Session[];
  loading: boolean;
}

export default function GradeHistoryScreen({ sessions, loading }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const filtered = sessions.filter(s => {
    const matchSearch = s.exercise?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || s.exercise_category === category;
    return matchSearch && matchCategory;
  });

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Performance Log</Text>
        <Text style={styles.title}>Grade History</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercise..."
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* Category filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.filterChip, category === cat && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, category === cat && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.count}>{filtered.length} session{filtered.length !== 1 ? 's' : ''}</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No sessions found</Text>
            <Text style={styles.emptySubtitle}>Try a different filter or submit your first set.</Text>
          </View>
        ) : (
          filtered.map(s => (
            <GradeCard
              key={s.id}
              session={s}
              onPress={() => setSelectedSession(s)}
            />
          ))
        )}
      </ScrollView>

      {/* Detail modal */}
      <Modal visible={!!selectedSession} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setSelectedSession(null)} />
          {selectedSession && (
            <View style={styles.detailSheet}>
              <View style={styles.detailHeader}>
                <View>
                  <Text style={styles.detailExercise}>{selectedSession.exercise}</Text>
                  <Text style={styles.detailDate}>{selectedSession.session_date}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedSession(null)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              {selectedSession.feedback && (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackLabel}>AI Feedback</Text>
                  <Text style={styles.feedbackText}>{selectedSession.feedback}</Text>
                </View>
              )}
              <GradeCard session={selectedSession} />
            </View>
          )}
        </View>
      </Modal>
    </View>
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
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: colors.foreground, fontSize: 14, paddingVertical: 12 },
  filterRow: { marginBottom: 16 },
  filterChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: {
    color: colors.mutedForeground,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChipTextActive: { color: colors.primaryForeground },
  count: {
    color: colors.mutedForeground,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.foreground,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 15,
    marginBottom: 6,
  },
  emptySubtitle: { color: colors.mutedForeground, fontSize: 13 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  detailSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    padding: 20,
    paddingBottom: 40,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailExercise: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailDate: { color: colors.mutedForeground, fontSize: 13, marginTop: 2 },
  closeBtn: { color: colors.mutedForeground, fontSize: 20 },
  feedbackBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 14,
    marginBottom: 14,
  },
  feedbackLabel: {
    color: colors.mutedForeground,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  feedbackText: { color: colors.foreground, fontSize: 14, lineHeight: 20 },
});
