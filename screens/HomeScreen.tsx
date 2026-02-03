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

  const handleImageSelected = (uri: string) => {
    setSelectedImageUri(uri);
    setAnalysisResult(null); // Clear previous results
  };

  const handleAnalyze = async () => {
    if (!selectedImageUri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisResult(null);

      // Get provider settings
      const providerType = await storage.getProviderType();
      if (!providerType) {
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

      const apiKey = await storage.getApiKey(providerType);
      if (!apiKey) {
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
      const provider = AIProviderFactory.createProvider(providerType, apiKey);
      const result = await provider.analyzeImage(selectedImageUri);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImageUri(null);
    setAnalysisResult(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Spark Sensei</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Image Pickers */}
        {!selectedImageUri && (
          <View style={styles.pickerSection}>
            <Text style={styles.subtitle}>
              Upload or capture an image of electronics or code
            </Text>
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
        )}

        {/* Selected Image Preview */}
        {selectedImageUri && (
          <View style={styles.imageSection}>
            <Image source={{ uri: selectedImageUri }} style={styles.image} />
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                disabled={analyzing}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
                onPress={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.analyzeButtonText}>🔍 Analyze</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading State */}
        {analyzing && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Sensei is analyzing your image...</Text>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult && !analyzing && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Analysis Results</Text>
            <AnalysisResult result={analysisResult} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pickerSection: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#E0E0E0',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#CCC',
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSection: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
});
