import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ImagePickerButton from '../components/ImagePickerButton';
import AnalysisResult from '../components/AnalysisResult';
import { AnalysisResult as AnalysisResultType } from '../types';
import { storage } from '../utils/storage';
import { AIProviderFactory } from '../services/AIProviderFactory';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [labNotes, setLabNotes] = useState('');

  const handleImageSelected = (uri: string) => {
    console.log('=== IMAGE SELECTED ===');
    console.log('Image URI:', uri);
    setSelectedImageUri(uri);
    setAnalysisResult(null); // Clear previous results
  };

  const handleAnalyze = async () => {
    console.log('=== ANALYZE BUTTON CLICKED ===');

    if (!selectedImageUri) {
      console.log('ERROR: No image selected');
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    console.log('Selected image URI:', selectedImageUri);

    try {
      setAnalyzing(true);
      setAnalysisResult(null);

      // Get provider settings
      console.log('Fetching provider settings...');
      const providerType = await storage.getProviderType();
      console.log('Provider type:', providerType);

      if (!providerType) {
        console.log('ERROR: No provider configured');
        setAnalyzing(false);
        Alert.alert(
          'Setup Required',
          'Please configure your AI provider in Settings',
          [
            {
              text: 'Go to Settings',
              onPress: () => navigation.navigate('Settings'),
            },
            { text: 'Cancel' },
          ]
        );
        return;
      }

      console.log('Fetching API key for provider:', providerType);
      const apiKey = await storage.getApiKey(providerType);
      console.log('API key exists:', !!apiKey, apiKey ? `(${apiKey.substring(0, 10)}...)` : '');

      if (!apiKey) {
        console.log('ERROR: No API key found');
        setAnalyzing(false);
        Alert.alert(
          'API Key Required',
          `Please enter your ${providerType} API key in Settings`,
          [
            {
              text: 'Go to Settings',
              onPress: () => navigation.navigate('Settings'),
            },
            { text: 'Cancel' },
          ]
        );
        return;
      }

      // Create provider and analyze image
      console.log('Creating AI provider...');
      const provider = AIProviderFactory.createProvider(providerType, apiKey);
      console.log('Provider created successfully');

      console.log('Starting image analysis...');
      const result = await provider.analyzeImage(selectedImageUri);
      console.log('Analysis complete! Result:', result);

      setAnalysisResult(result);
      console.log('Result set in state');
    } catch (error) {
      console.error('=== ANALYSIS ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      Alert.alert(
        'Analysis Failed',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      console.log('Setting analyzing to false');
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImageUri(null);
    setAnalysisResult(null);
    setLabNotes('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>SPARK SENSEI</Text>
            <Text style={styles.headerSubtitle}>SENIOR ENGINEERING LAB</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.statusLabel}>SYSTEM STATUS</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>OPERATIONAL</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
        <Text style={styles.mainTitle}>AUDIT SUBMISSION</Text>
        <Text style={styles.mainSubtitle}>
          HARDWARE PHOTOS OR CODE SCREENSHOTS ONLY. SPARK SENSEI IDENTIFIES FLAWS AND CORRECTS SYNTAX
          ERRORS.
        </Text>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Upload Area */}
          <View style={styles.uploadSection}>
            {!selectedImageUri ? (
              <View style={styles.uploadBox}>
                <View style={styles.uploadIconContainer}>
                  <Text style={styles.uploadIcon}>🖼️</Text>
                </View>
                <Text style={styles.uploadTitle}>UPLOAD DOCUMENTATION</Text>
                <Text style={styles.uploadHint}>JPG, PNG, WEBP</Text>
                <View style={styles.uploadButtons}>
                  <ImagePickerButton
                    type="camera"
                    onImageSelected={handleImageSelected}
                    disabled={analyzing}
                  />
                  <ImagePickerButton
                    type="gallery"
                    onImageSelected={handleImageSelected}
                    disabled={analyzing}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.clearImageButton} onPress={handleClear}>
                  <Text style={styles.clearImageText}>✕ CLEAR</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Status/Results Area */}
          <View style={styles.statusSection}>
            {!analyzing && !analysisResult && (
              <View style={styles.idleContainer}>
                <View style={styles.idleIconContainer}>
                  <Text style={styles.idleIcon}>📋</Text>
                </View>
                <Text style={styles.idleTitle}>SYSTEM IDLE</Text>
                <Text style={styles.idleText}>
                  Provide lab context to begin automated validation.
                </Text>
              </View>
            )}

            {analyzing && (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.analyzingText}>ANALYZING...</Text>
                <Text style={styles.analyzingSubtext}>Processing documentation</Text>
              </View>
            )}

            {analysisResult && !analyzing && (
              <View style={styles.resultsContainer}>
                <AnalysisResult result={analysisResult} />
              </View>
            )}
          </View>
        </View>

        {/* Laboratory Notes */}
        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <View style={styles.notesDot} />
            <Text style={styles.notesLabel}>LABORATORY NOTES</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="DESCRIBE YOUR CIRCUIT INTENT OR SPECIFIC CODE ISSUES..."
            placeholderTextColor="#4B5563"
            multiline
            numberOfLines={4}
            value={labNotes}
            onChangeText={setLabNotes}
          />
        </View>

        {/* Request Analysis Button */}
        <TouchableOpacity
          style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={analyzing || !selectedImageUri}
        >
          <View style={styles.analyzeButtonContent}>
            <View style={styles.analyzeButtonIcon} />
            <Text style={styles.analyzeButtonText}>REQUEST ANALYSIS</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLeft}>© SPARK SENSEI CORE</Text>
        <Text style={styles.footerRight}>MM ANALYSIS V3.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 2,
    marginTop: 2,
  },
  statusButton: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 12,
    letterSpacing: 2,
  },
  mainSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 20,
  },
  uploadSection: {
    flex: 1,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#374151',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#111111',
    minHeight: 400,
    justifyContent: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    fontSize: 40,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  uploadHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  uploadButtons: {
    width: '100%',
    gap: 12,
  },
  imagePreviewContainer: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  imagePreview: {
    width: '100%',
    height: 400,
    backgroundColor: '#1F2937',
  },
  clearImageButton: {
    backgroundColor: '#DC2626',
    padding: 12,
    alignItems: 'center',
  },
  clearImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusSection: {
    flex: 1,
    minHeight: 400,
  },
  idleContainer: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  idleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  idleIcon: {
    fontSize: 40,
  },
  idleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  idleText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  analyzingContainer: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: 20,
    letterSpacing: 1,
  },
  analyzingSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  resultsContainer: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  notesInput: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 13,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 18,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#374151',
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6B7280',
    marginRight: 12,
  },
  analyzeButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  footerLeft: {
    fontSize: 10,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  footerRight: {
    fontSize: 10,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
});
