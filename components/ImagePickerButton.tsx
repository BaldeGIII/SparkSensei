import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerButtonProps {
  onImageSelected: (uri: string) => void;
  type: 'camera' | 'gallery';
  disabled?: boolean;
}

export default function ImagePickerButton({
  onImageSelected,
  type,
  disabled = false,
}: ImagePickerButtonProps) {
  const handlePress = async () => {
    try {
      if (type === 'camera') {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Camera permission is required to take photos');
          return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri);
        }
      } else {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Gallery permission is required to select photos');
          return;
        }

        // Launch gallery
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>
        {type === 'camera' ? '📷 CAPTURE IMAGE' : '📁 SELECT FILE'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
});
