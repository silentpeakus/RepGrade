import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors, gradeColor } from '../theme';
import GradeCard from '../components/GradeCard';

interface Session {
  id: string;
  exercise: string;
  session_date: string;
  weight_lbs?: number;
  reps?: number;
  grade_letter?: string;
  form_score?: number;
  intensity_score?: number;
  tempo_score?: number;
  overall_grade?: number;
  ready_to_progress?: boolean;
  status?: string;
}

interface Props {
  userName?: string;
  sessions: Session[];
  loading: boolean;
  onSubmitSet: () => void;
  onViewHistory: () => void;
  onViewGPA: () => void;
}

const gradeToLetter = (score: number | null): string => {
  if (!score) return '--';
  if (score >= 93) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 87) return 'A-';
  if (score >= 83) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 77) return 'B-';
  if (score >= 73) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

function StatBlock({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: boolean }) {
  return (
    <View style={[styles.statBlock, accent && styles.statBlockAccent]}>
      <Text style={[styles.statValue, accent && { color: colors.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

export default function AthleteDashboardScreen({ userName, sessions, loading, onSubmitSet, onViewHistory, onViewGPA }: Props) {
  const completed = sessions.filter(s => s.status === 'completed');
  const avgGpa = completed.length
    ? Math.round(completed.reduce((acc, s) => acc + (s.overall_grade || 0), 0) / completed.length)
    : null;
  const readyToProgress = completed.filter(s => s.ready_to_progress).length;
  const recentSessions = completed.slice(0, 4);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <Text style={styles.welcomeLabel}>Welcome back</Text>
      <Text style={styles.title}>{userName?.split(' ')[0] || 'Athlete'}</Text>

      <View style={styles.statsRow}>
        <StatBlock label="Overall GPA" value={avgGpa ?? '--'} sub="Combined score" accent />
        <StatBlock label="Grade" value={gradeToLetter(avgGpa)} sub="Letter grade" />
        <StatBlock label="Sessions" value={completed.length} sub="Completed" />
        <StatBlock label="Progress" value={readyToProgress} sub="Ready" accent />
      </View>

      <TouchableOpacity style={styles.ctaCard} onPress={onSubmitSet} activeOpacity={0.8}>
        <View>
          <Text style={styles.ctaTitle}>Submit Your Next Set</Text>
          <Text style={styles.ctaSubtitle}>Upload a video. Get graded in seconds.</Text>
        </View>
        <View style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Grade My Set →</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <TouchableOpacity onPress={onViewHistory}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : recentSessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptySubtitle}>Submit your first set to get graded.</Text>
        </View>
      ) : (
        recentSessions.map(s => <GradeCard key={s.id} session={s} />)
      )}

      <TouchableOpacity style={styles.gpaLink} onPress={onViewGPA} activeOpacity={0.8}>
        <Text style={styles.gpaLinkIcon}>📈</Text>
        <View style={styles.gpaLinkText}>
          <Text style={styles.gpaLinkTitle}>View Full GPA Breakdown</Text>
          <Text style={styles.gpaLinkSub}>See which exercises need work</Text>
        </View>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  welcomeLabel: {
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
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statBlock: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  statBlockAccent: { borderColor: 'rgba(245,158,11,0.4)' },
  statValue: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
    marginTop: 2,
  },
  statSub: {
    color: colors.mutedForeground,
    fontSize: 9,
    marginTop: 1,
  },
  ctaCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 4,
    padding: 20,
    marginBottom: 24,
    gap: 14,
  },
  ctaTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ctaSubtitle: { color: colors.mutedForeground, fontSize: 13 },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: colors.primaryForeground,
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewAll: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  gpaLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  gpaLinkIcon: { fontSize: 20 },
  gpaLinkText: { flex: 1 },
  gpaLinkTitle: {
    color: colors.foreground,
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gpaLinkSub: { color: colors.mutedForeground, fontSize: 12, marginTop: 2 },
});
