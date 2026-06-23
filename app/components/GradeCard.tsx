import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, gradeColor, gradeBorderColor } from '../theme';

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
  feedback?: string;
}

function ScorePill({ label, score }: { label: string; score?: number }) {
  return (
    <View style={[styles.scorePill, { borderColor: gradeBorderColor(score) }]}>
      <Text style={[styles.scoreValue, { color: gradeColor(score) }]}>{score ?? '--'}</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
}

export default function GradeCard({ session, onPress }: { session: Session; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.card, { borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.exercise}>{session.exercise}</Text>
          <Text style={styles.meta}>
            {session.session_date}
            {session.weight_lbs ? ` · ${session.weight_lbs} lbs` : ''}
            {session.reps ? ` · ${session.reps} reps` : ''}
          </Text>
        </View>
        <Text style={[styles.gradeLetter, { color: gradeColor(session.overall_grade) }]}>
          {session.grade_letter || '--'}
        </Text>
      </View>
      <View style={styles.scores}>
        <ScorePill label="Form" score={session.form_score} />
        <ScorePill label="Intensity" score={session.intensity_score} />
        <ScorePill label="Tempo" score={session.tempo_score} />
      </View>
      {session.ready_to_progress && (
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>↑ Ready to increase weight</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: { flex: 1 },
  exercise: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meta: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  gradeLetter: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
  },
  scores: {
    flexDirection: 'row',
    gap: 8,
  },
  scorePill: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 10,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  scoreLabel: {
    color: colors.mutedForeground,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
    fontWeight: '600',
  },
  progressBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  progressText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
