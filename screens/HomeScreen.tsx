import React, { useState, useEffect } from 'react';
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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ImagePickerButton from '../components/ImagePickerButton';
import AnalysisResult from '../components/AnalysisResult';
import { AnalysisResult as AnalysisResultType } from '../types';
import { storage } from '../utils/storage';
import { AIProviderFactory } from '../services/AIProviderFactory';
import { SubscriptionTier } from '../types/subscription';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Premium: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [labNotes, setLabNotes] = useState('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [analysisCount, setAnalysisCount] = useState(0);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const status = await storage.getSubscriptionStatus();
    setSubscriptionTier(status.tier);
    setAnalysisCount(status.analysisCount);
  };

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage].slice(-20)); // Keep last 20 logs
  };

  const handleImageSelected = (uri: string) => {
    addDebugLog('=== IMAGE SELECTED ===');
    addDebugLog(`Image URI: ${uri.substring(0, 50)}...`);
    addDebugLog(`URI type: ${uri.startsWith('blob:') ? 'blob' : uri.startsWith('data:') ? 'data' : 'file'}`);
    setSelectedImageUri(uri);
    setAnalysisResult(null);
    setDebugLogs([]); // Clear previous logs
  };

  const handleAnalyze = async () => {
    addDebugLog('=== ANALYZE BUTTON CLICKED ===');

    if (!selectedImageUri) {
      addDebugLog('❌ ERROR: No image selected');
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    // Check free tier limit (DISABLED FOR DEVELOPMENT)
    // const status = await storage.getSubscriptionStatus();
    // if (status.tier === SubscriptionTier.FREE && status.analysisCount >= 5) {
    //   addDebugLog('❌ ERROR: Free tier limit reached (5/5 analyses today)');
    //   Alert.alert(
    //     'Daily Limit Reached',
    //     'You have used all 5 free analyses today. Upgrade to Premium for unlimited analysis!',
    //     [
    //       {
    //         text: 'Upgrade to Premium',
    //         onPress: () => navigation.navigate('Premium'),
    //       },
    //       { text: 'Cancel', style: 'cancel' },
    //     ]
    //   );
    //   return;
    // }

    try {
      setAnalyzing(true);
      setAnalysisResult(null);

      // Get provider settings
      addDebugLog('📋 Fetching provider settings...');
      const providerType = await storage.getProviderType();
      addDebugLog(`✓ Provider type: ${providerType || 'NONE'}`);

      if (!providerType) {
        addDebugLog('❌ ERROR: No provider configured');
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

      addDebugLog(`🔑 Fetching API key for ${providerType}...`);
      const apiKey = await storage.getApiKey(providerType);
      addDebugLog(`✓ API key exists: ${!!apiKey} ${apiKey ? `(${apiKey.substring(0, 10)}...)` : ''}`);

      if (!apiKey) {
        addDebugLog('❌ ERROR: No API key found');
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
      addDebugLog(`🔨 Creating ${providerType} provider...`);
      const provider = AIProviderFactory.createProvider(providerType, apiKey);
      addDebugLog('✓ Provider created successfully');

      addDebugLog('🔍 Starting image analysis...');
      addDebugLog(`   Image URI type: ${selectedImageUri.startsWith('blob:') ? 'blob' : 'data'}`);

      const result = await provider.analyzeImage(selectedImageUri);

      addDebugLog('✅ Analysis complete!');
      addDebugLog(`   Diagnosis: ${result.diagnosis.substring(0, 50)}...`);
      addDebugLog(`   Details count: ${result.details.length}`);
      addDebugLog(`   Fix length: ${result.fix.length} chars`);
      addDebugLog(`   Note: ${result.note.substring(0, 50)}...`);

      // Increment analysis count for free tier
      if (subscriptionTier === SubscriptionTier.FREE) {
        const newCount = await storage.incrementAnalysisCount();
        setAnalysisCount(newCount);
        addDebugLog(`📊 Analysis count: ${newCount}/5`);
      }

      setAnalysisResult(result);
    } catch (error) {
      addDebugLog('=== ❌ ANALYSIS ERROR ===');
      addDebugLog(`Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
      addDebugLog(`Error message: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.stack) {
        const stackLines = error.stack.split('\n').slice(0, 3);
        stackLines.forEach(line => addDebugLog(`  ${line.trim()}`));
      }

      Alert.alert(
        'Analysis Failed',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      addDebugLog('🏁 Analysis flow complete');
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImageUri(null);
    setAnalysisResult(null);
    setLabNotes('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
        <View style={styles.headerRight}>
          {subscriptionTier === SubscriptionTier.FREE && (
            <TouchableOpacity
              style={styles.premiumBadge}
              onPress={() => navigation.navigate('Premium')}
            >
              <Text style={styles.premiumBadgeIcon}>👑</Text>
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
            <Text style={styles.settingsText}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>AUDIT SUBMISSION</Text>
          <Text style={styles.mainSubtitle}>
            HARDWARE PHOTOS OR CODE SCREENSHOTS ONLY. SPARK SENSEI IDENTIFIES FLAWS AND CORRECTS SYNTAX
            ERRORS.
          </Text>
        </View>

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

      </View>

      {/* Laboratory Notes and Button - Fixed at bottom */}
      <View style={styles.bottomSection}>
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
            numberOfLines={2}
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

        {/* Free Tier Usage Indicator */}
        {subscriptionTier === SubscriptionTier.FREE && (
          <View style={styles.usageIndicator}>
            <Text style={styles.usageText}>
              {analysisCount}/5 analyses used today
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Premium')}>
              <Text style={styles.upgradeLink}>Upgrade for unlimited →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLeft}>© SPARK SENSEI CORE</Text>
        <Text style={styles.footerRight}>MM ANALYSIS V3.0</Text>
      </View>

      {/* Debug Panel */}
      {debugLogs.length > 0 && (
        <View style={styles.debugPanel}>
          <TouchableOpacity
            style={styles.debugHeader}
            onPress={() => setShowDebug(!showDebug)}
          >
            <Text style={styles.debugTitle}>🔧 DEBUG CONSOLE</Text>
            <Text style={styles.debugToggle}>{showDebug ? '▼' : '▲'}</Text>
          </TouchableOpacity>

          {showDebug && (
            <ScrollView style={styles.debugContent}>
              {debugLogs.map((log, index) => {
                let logStyle = styles.debugLogDefault;
                if (log.includes('✓') || log.includes('✅')) {
                  logStyle = styles.debugLogSuccess;
                } else if (log.includes('❌') || log.includes('ERROR')) {
                  logStyle = styles.debugLogError;
                } else if (log.includes('🔍') || log.includes('🔨') || log.includes('📋')) {
                  logStyle = styles.debugLogInfo;
                }

                return (
                  <Text key={index} style={[styles.debugLog, logStyle]}>
                    {log}
                  </Text>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  premiumBadgeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  settingsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  mainSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  uploadSection: {
    flex: 1,
    minHeight: 0,
  },
  uploadBox: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#374151',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#111111',
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
    flex: 1,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  imagePreview: {
    width: '100%',
    flex: 1,
    resizeMode: 'contain',
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
    minHeight: 0,
  },
  idleContainer: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    overflow: 'hidden',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  notesSection: {
    marginBottom: 12,
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
    padding: 12,
    color: '#FFFFFF',
    fontSize: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 14,
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
  usageIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  usageText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  upgradeLink: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: 'bold',
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
  debugPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    maxHeight: 300,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
    letterSpacing: 1,
  },
  debugToggle: {
    fontSize: 14,
    color: '#6B7280',
  },
  debugContent: {
    maxHeight: 200,
    padding: 12,
  },
  debugLog: {
    fontSize: 10,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
    marginBottom: 4,
    lineHeight: 16,
  },
  debugLogDefault: {
    color: '#9CA3AF',
  },
  debugLogSuccess: {
    color: '#10B981',
  },
  debugLogError: {
    color: '#EF4444',
  },
  debugLogInfo: {
    color: '#3B82F6',
  },
});
