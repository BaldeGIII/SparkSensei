import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { AnalysisResult as AnalysisResultType } from '../types';

interface AnalysisResultProps {
  result: AnalysisResultType;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ANALYSIS COMPLETE</Text>

      {/* Diagnosis Section */}
      <View style={[styles.section, styles.diagnosisSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🛑</Text>
          <Text style={styles.sectionTitle}>DIAGNOSIS</Text>
        </View>
        <Text style={styles.sectionContent}>{result.diagnosis || 'No diagnosis provided.'}</Text>
      </View>

      {/* Details Section */}
      <View style={[styles.section, styles.detailsSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🔍</Text>
          <Text style={styles.sectionTitle}>DETAILS</Text>
        </View>
        {result.details && result.details.length > 0 ? (
          result.details.map((detail, index) => (
            <View key={index} style={styles.detailItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.detailText}>{detail}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionContent}>No specific details provided.</Text>
        )}
      </View>

      {/* Fix Section */}
      <View style={[styles.section, styles.fixSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💡</Text>
          <Text style={styles.sectionTitle}>THE FIX</Text>
        </View>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{result.fix || 'No fix provided.'}</Text>
        </View>
      </View>

      {/* Note Section */}
      <View style={[styles.section, styles.noteSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🎓</Text>
          <Text style={styles.sectionTitle}>SENSEI'S NOTE</Text>
        </View>
        <Text style={[styles.sectionContent, styles.noteText]}>
          "{result.note || 'Keep studying, the path to mastery is long.'}"
        </Text>
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
  diagnosisSection: {
    borderLeftColor: '#EF4444',
  },
  detailsSection: {
    borderLeftColor: '#3B82F6',
  },
  fixSection: {
    borderLeftColor: '#FBBF24',
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
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: -2,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: '#0A0A0A',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  codeText: {
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 12,
    color: '#93C5FD',
    lineHeight: 18,
  },
  noteText: {
    fontStyle: 'italic',
    color: '#D1D5DB',
  },
});
