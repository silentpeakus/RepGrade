import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

export type Tab = 'dashboard' | 'submit' | 'history';

interface Props {
  activeTab: Tab;
  onTabPress: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'submit', label: 'Submit', icon: '⚡' },
  { id: 'history', label: 'History', icon: '📋' },
];

export default function BottomTabBar({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, active && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            {active && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingBottom: 24,
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center', position: 'relative' },
  icon: { fontSize: 20, marginBottom: 2, opacity: 0.4 },
  iconActive: { opacity: 1 },
  label: {
    color: colors.mutedForeground,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: { color: colors.primary },
  indicator: {
    position: 'absolute',
    top: -10,
    width: 32,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});
