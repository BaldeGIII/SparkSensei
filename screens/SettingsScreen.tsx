import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AIProviderType } from '../types';
import { storage } from '../utils/storage';

export default function SettingsScreen() {
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(AIProviderType.CLAUDE);
  const [apiKeys, setApiKeys] = useState({
    [AIProviderType.CLAUDE]: '',
    [AIProviderType.OPENAI]: '',
    [AIProviderType.GEMINI]: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const providerType = await storage.getProviderType();
      const claudeKey = await storage.getApiKey(AIProviderType.CLAUDE);
      const openaiKey = await storage.getApiKey(AIProviderType.OPENAI);
      const geminiKey = await storage.getApiKey(AIProviderType.GEMINI);

      if (providerType) {
        setSelectedProvider(providerType);
      }

      setApiKeys({
        [AIProviderType.CLAUDE]: claudeKey || '',
        [AIProviderType.OPENAI]: openaiKey || '',
        [AIProviderType.GEMINI]: geminiKey || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate that the selected provider has an API key
      if (!apiKeys[selectedProvider]) {
        Alert.alert('Error', `Please enter an API key for ${selectedProvider}`);
        return;
      }

      // Save provider type
      await storage.saveProviderType(selectedProvider);

      // Save all API keys
      for (const [providerType, apiKey] of Object.entries(apiKeys)) {
        if (apiKey) {
          await storage.saveApiKey(providerType as AIProviderType, apiKey);
        }
      }

      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateApiKey = (provider: AIProviderType, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI Provider Settings</Text>
        <Text style={styles.subtitle}>
          Select your preferred AI provider and enter the API key
        </Text>

        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Provider</Text>

          <TouchableOpacity
            style={[
              styles.providerButton,
              selectedProvider === AIProviderType.CLAUDE && styles.providerButtonSelected,
            ]}
            onPress={() => setSelectedProvider(AIProviderType.CLAUDE)}
          >
            <Text
              style={[
                styles.providerButtonText,
                selectedProvider === AIProviderType.CLAUDE && styles.providerButtonTextSelected,
              ]}
            >
              Claude (Anthropic)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.providerButton,
              selectedProvider === AIProviderType.OPENAI && styles.providerButtonSelected,
            ]}
            onPress={() => setSelectedProvider(AIProviderType.OPENAI)}
          >
            <Text
              style={[
                styles.providerButtonText,
                selectedProvider === AIProviderType.OPENAI && styles.providerButtonTextSelected,
              ]}
            >
              ChatGPT (OpenAI)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.providerButton,
              selectedProvider === AIProviderType.GEMINI && styles.providerButtonSelected,
            ]}
            onPress={() => setSelectedProvider(AIProviderType.GEMINI)}
          >
            <Text
              style={[
                styles.providerButtonText,
                selectedProvider === AIProviderType.GEMINI && styles.providerButtonTextSelected,
              ]}
            >
              Gemini (Google)
            </Text>
          </TouchableOpacity>
        </View>

        {/* API Key Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Keys</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Claude API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="sk-ant-api..."
              value={apiKeys[AIProviderType.CLAUDE]}
              onChangeText={(value) => updateApiKey(AIProviderType.CLAUDE, value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>Get your key at: console.anthropic.com</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>OpenAI API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              value={apiKeys[AIProviderType.OPENAI]}
              onChangeText={(value) => updateApiKey(AIProviderType.OPENAI, value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>Get your key at: platform.openai.com/api-keys</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gemini API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="AIza..."
              value={apiKeys[AIProviderType.GEMINI]}
              onChangeText={(value) => updateApiKey(AIProviderType.GEMINI, value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>Get your key at: makersuite.google.com/app/apikey</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  providerButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  providerButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  providerButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  providerButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
