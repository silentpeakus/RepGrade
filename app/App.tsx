import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { colors } from './theme';
import BottomTabBar, { Tab } from './navigation/BottomTabBar';
import LoginScreen from './screens/LoginScreen';
import AthleteDashboardScreen from './screens/AthleteDashboardScreen';
import SubmitSetScreen from './screens/SubmitSetScreen';
import GradeHistoryScreen from './screens/GradeHistoryScreen';

const DEMO_SESSIONS = [
  {
    id: '1',
    exercise: 'Squat',
    exercise_category: 'legs',
    session_date: '2025-06-20',
    weight_lbs: 225,
    reps: 5,
    grade_letter: 'B+',
    form_score: 84,
    intensity_score: 88,
    tempo_score: 79,
    overall_grade: 84,
    ready_to_progress: false,
    feedback: 'Good depth and bar path. Work on keeping your chest up in the bottom position.',
    status: 'completed',
  },
  {
    id: '2',
    exercise: 'Bench Press',
    exercise_category: 'chest',
    session_date: '2025-06-18',
    weight_lbs: 185,
    reps: 8,
    grade_letter: 'A-',
    form_score: 91,
    intensity_score: 87,
    tempo_score: 90,
    overall_grade: 90,
    ready_to_progress: true,
    feedback: 'Excellent form. Consistent bar path and controlled tempo throughout all reps.',
    status: 'completed',
  },
  {
    id: '3',
    exercise: 'Deadlift',
    exercise_category: 'back',
    session_date: '2025-06-15',
    weight_lbs: 315,
    reps: 3,
    grade_letter: 'B',
    form_score: 80,
    intensity_score: 95,
    tempo_score: 76,
    overall_grade: 82,
    ready_to_progress: false,
    feedback: 'Strong pull. Focus on keeping your lower back neutral through the lockout.',
    status: 'completed',
  },
];

type Screen = 'login' | 'app';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sessions] = useState(DEMO_SESSIONS);

  const handleLogin = async (_email: string, _password: string) => {
    // TODO: wire real auth
    setScreen('app');
  };

  const handleSubmit = async (exercise: string, _category: string, _reps: string, _weight: string) => {
    // TODO: wire real AI grading API
    Alert.alert(
      'Set Submitted!',
      `${exercise} — AI grading will be available once the backend is connected.`,
      [{ text: 'OK', onPress: () => setActiveTab('history') }]
    );
  };

  if (screen === 'login') {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <LoginScreen
          onLogin={handleLogin}
          onNavigateRegister={() => Alert.alert('Coming soon', 'Registration screen coming soon.')}
          onNavigateForgotPassword={() => Alert.alert('Coming soon', 'Password reset coming soon.')}
        />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <AthleteDashboardScreen
            userName="Athlete"
            sessions={sessions}
            loading={false}
            onSubmitSet={() => setActiveTab('submit')}
            onViewHistory={() => setActiveTab('history')}
            onViewGPA={() => Alert.alert('Coming soon', 'GPA Dashboard coming soon.')}
          />
        )}
        {activeTab === 'submit' && (
          <SubmitSetScreen onSubmit={handleSubmit} />
        )}
        {activeTab === 'history' && (
          <GradeHistoryScreen sessions={sessions} loading={false} />
        )}
      </View>
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
});
