import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AnalysisResult as AnalysisResultType } from '../types';

interface AnalysisResultProps {
  result: AnalysisResultType;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>🛑 DIAGNOSIS</Text>
        <Text style={styles.sectionContent}>{result.diagnosis}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>🔍 DETAILS</Text>
        <Text style={styles.sectionContent}>{result.details}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>💡 THE FIX</Text>
        <Text style={styles.sectionContent}>{result.fix}</Text>
      </View>

      <View style={[styles.section, styles.noteSection]}>
        <Text style={styles.sectionHeader}>🎓 SENSEI'S NOTE</Text>
        <Text style={[styles.sectionContent, styles.noteText]}>{result.senseiNote}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  noteSection: {
    borderLeftColor: '#FF9500',
    backgroundColor: '#FFF9E6',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  noteText: {
    fontStyle: 'italic',
    color: '#666',
  },
});
