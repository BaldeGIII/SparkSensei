import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AnalysisResult as AnalysisResultType } from '../types';

interface AnalysisResultProps {
  result: AnalysisResultType;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ANALYSIS COMPLETE</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🛑</Text>
          <Text style={styles.sectionTitle}>DIAGNOSIS</Text>
        </View>
        <Text style={styles.sectionContent}>{result.diagnosis}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🔍</Text>
          <Text style={styles.sectionTitle}>DETAILS</Text>
        </View>
        <Text style={styles.sectionContent}>{result.details}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💡</Text>
          <Text style={styles.sectionTitle}>THE FIX</Text>
        </View>
        <Text style={styles.sectionContent}>{result.fix}</Text>
      </View>

      <View style={[styles.section, styles.noteSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🎓</Text>
          <Text style={styles.sectionTitle}>SENSEI'S NOTE</Text>
        </View>
        <Text style={[styles.sectionContent, styles.noteText]}>{result.senseiNote}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 20,
    letterSpacing: 1,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  noteSection: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#1F1F1F',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E5E7EB',
    letterSpacing: 1,
  },
  sectionContent: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  noteText: {
    fontStyle: 'italic',
    color: '#D1D5DB',
  },
});
