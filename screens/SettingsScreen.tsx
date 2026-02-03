import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AIProviderType } from '../types';
import { storage } from '../utils/storage';

export default function SettingsScreen() {
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const providerType = await storage.getProviderType();

      if (providerType) {
        setSelectedProvider(providerType);
        const savedKey = await storage.getApiKey(providerType);
        if (savedKey) {
          setApiKey(savedKey);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = async (provider: AIProviderType) => {
    setSelectedProvider(provider);
    setSuccessMessage('');

    const savedKey = await storage.getApiKey(provider);
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setApiKey('');
    }
  };

  const handleSave = async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select an AI provider');
      return;
    }

    if (!apiKey.trim()) {
      Alert.alert('Error', `Please enter an API key for ${selectedProvider}`);
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage('');

      await storage.saveProviderType(selectedProvider);
      await storage.saveApiKey(selectedProvider, apiKey);

      setSuccessMessage('Configuration saved successfully!');
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getProviderInfo = (provider: AIProviderType) => {
    switch (provider) {
      case AIProviderType.CLAUDE:
        return {
          name: 'CLAUDE',
          company: 'Anthropic',
          model: 'Claude 3.5 Sonnet',
          url: 'console.anthropic.com',
          placeholder: 'sk-ant-api03-...',
          icon: '🧠',
        };
      case AIProviderType.OPENAI:
        return {
          name: 'CHATGPT',
          company: 'OpenAI',
          model: 'GPT-4 Vision',
          url: 'platform.openai.com/api-keys',
          placeholder: 'sk-proj-...',
          icon: '🤖',
        };
      case AIProviderType.GEMINI:
        return {
          name: 'GEMINI',
          company: 'Google',
          model: 'Gemini 1.5 Pro',
          url: 'makersuite.google.com/app/apikey',
          placeholder: 'AIzaSy...',
          icon: '✨',
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>LOADING CONFIGURATION</Text>
      </View>
    );
  }

  const renderProviderCard = (provider: AIProviderType) => {
    const info = getProviderInfo(provider);
    const isSelected = selectedProvider === provider;

    return (
      <TouchableOpacity
        key={provider}
        style={[styles.providerCard, isSelected && styles.providerCardSelected]}
        onPress={() => handleProviderSelect(provider)}
        activeOpacity={0.7}
      >
        <View style={styles.providerCardContent}>
          <View style={styles.providerCardLeft}>
            <View style={styles.providerIconContainer}>
              <Text style={styles.providerIcon}>{info.icon}</Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={[styles.providerName, isSelected && styles.providerNameSelected]}>
                {info.name}
              </Text>
              <Text style={styles.providerMeta}>
                {info.company} • {info.model}
              </Text>
            </View>
          </View>
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SYSTEM CONFIGURATION</Text>
          <Text style={styles.subtitle}>
            Select and configure your preferred AI provider for hardware and code analysis
          </Text>
        </View>

        {/* Success Message */}
        {successMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* Provider Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>AI PROVIDER SELECTION</Text>
          </View>

          {renderProviderCard(AIProviderType.CLAUDE)}
          {renderProviderCard(AIProviderType.OPENAI)}
          {renderProviderCard(AIProviderType.GEMINI)}
        </View>

        {/* API Credentials */}
        {selectedProvider && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>API CREDENTIALS</Text>
            </View>

            <View style={styles.credentialsCard}>
              <View style={styles.credentialsHeader}>
                <Text style={styles.credentialsIcon}>
                  {getProviderInfo(selectedProvider).icon}
                </Text>
                <View style={styles.credentialsHeaderText}>
                  <Text style={styles.credentialsTitle}>
                    {getProviderInfo(selectedProvider).name} API KEY
                  </Text>
                  <Text style={styles.credentialsSubtitle}>
                    Required for {getProviderInfo(selectedProvider).company} integration
                  </Text>
                </View>
              </View>

              <TextInput
                style={styles.apiInput}
                placeholder={getProviderInfo(selectedProvider).placeholder}
                placeholderTextColor="#4B5563"
                value={apiKey}
                onChangeText={(value) => {
                  setApiKey(value);
                  setSuccessMessage('');
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.apiHint}>
                <Text style={styles.apiHintText}>
                  <Text style={styles.apiHintBold}>Get your API key: </Text>
                  {getProviderInfo(selectedProvider).url}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!selectedProvider || !apiKey || saving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!selectedProvider || !apiKey || saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <>
              <ActivityIndicator color="#3B82F6" size="small" />
              <Text style={styles.saveButtonText}>SAVING...</Text>
            </>
          ) : (
            <>
              <View style={styles.saveButtonDot} />
              <Text style={styles.saveButtonText}>SAVE CONFIGURATION</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Help Section */}
        {!selectedProvider && (
          <View style={styles.helpCard}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpIcon}>💡</Text>
              <Text style={styles.helpTitle}>GETTING STARTED</Text>
            </View>
            <Text style={styles.helpText}>
              Select an AI provider above to configure your API credentials. Your selected provider
              will power all hardware circuit analysis and code debugging features.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 14,
    letterSpacing: 1.5,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  successBanner: {
    backgroundColor: '#1F2937',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 24,
    color: '#10B981',
    marginRight: 12,
  },
  successText: {
    flex: 1,
    color: '#10B981',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 2,
  },
  providerCard: {
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  providerCardSelected: {
    backgroundColor: '#1A1F2E',
    borderColor: '#3B82F6',
  },
  providerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerIcon: {
    fontSize: 24,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  providerNameSelected: {
    color: '#60A5FA',
  },
  providerMeta: {
    fontSize: 12,
    color: '#4B5563',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  credentialsCard: {
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 24,
  },
  credentialsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  credentialsIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  credentialsHeaderText: {
    flex: 1,
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  credentialsSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  apiInput: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  apiHint: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  apiHintText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  apiHintBold: {
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#111111',
    borderColor: '#374151',
    opacity: 0.4,
  },
  saveButtonDot: {
    width: 8,
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    marginRight: 12,
  },
  saveButtonText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginLeft: 8,
  },
  helpCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    marginTop: 16,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});
