import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { SubscriptionTier, TIER_PRICING, TIER_FEATURES } from '../types/subscription';

export default function PremiumScreen() {
  const navigation = useNavigation();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const status = await storage.getSubscriptionStatus();
    setCurrentTier(status.tier);
  };

  const handleTierChange = async (newTier: SubscriptionTier) => {
    const isUpgrade =
      (currentTier === SubscriptionTier.FREE && newTier !== SubscriptionTier.FREE) ||
      (currentTier === SubscriptionTier.PREMIUM && newTier === SubscriptionTier.PRO);

    const isDowngrade =
      (currentTier === SubscriptionTier.PRO && newTier !== SubscriptionTier.PRO) ||
      (currentTier === SubscriptionTier.PREMIUM && newTier === SubscriptionTier.FREE);

    const action = isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Change';

    // TODO: Integrate with Stripe/RevenueCat/payment processor
    Alert.alert(
      'Coming Soon',
      `Payment integration will be added soon!\n\nFor now, this is a demo. You would ${action.toLowerCase()} to ${newTier.toUpperCase()}.`,
      [
        {
          text: `Demo ${action}`,
          onPress: async () => {
            if (newTier === SubscriptionTier.PREMIUM) {
              await storage.upgradeToPremium();
            } else if (newTier === SubscriptionTier.PRO) {
              await storage.upgradeToPro();
            } else {
              // Reset to free
              const status = await storage.getSubscriptionStatus();
              status.tier = SubscriptionTier.FREE;
              await storage.saveSubscriptionStatus(status);
            }
            await loadSubscription();
            Alert.alert('Success', `${action}d to ${newTier.toUpperCase()}!`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MANAGE SUBSCRIPTION</Text>
          <Text style={styles.subtitle}>
            {currentTier === SubscriptionTier.FREE
              ? 'Unlock advanced analysis features and unlimited access'
              : 'View and manage your subscription plan'}
          </Text>
        </View>

        {/* Current Tier Badge */}
        <View style={styles.currentTierBadge}>
          <Text style={styles.currentTierLabel}>CURRENT PLAN</Text>
          <Text style={styles.currentTierValue}>{currentTier.toUpperCase()}</Text>
        </View>

        {/* Free Tier Card */}
        <View style={[styles.tierCard, currentTier === SubscriptionTier.FREE && styles.activeTier]}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierName}>FREE</Text>
            {currentTier === SubscriptionTier.FREE && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.tierPrice}>$0</Text>
          <Text style={styles.tierPeriod}>Forever</Text>

          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ 5 analyses per day</Text>
            <Text style={styles.featureItem}>✓ OpenAI GPT-4o only</Text>
            <Text style={styles.featureItem}>✓ Basic component identification</Text>
            <Text style={styles.featureItemDisabled}>✗ Web search component lookup</Text>
            <Text style={styles.featureItemDisabled}>✗ Component database access</Text>
            <Text style={styles.featureItemDisabled}>✗ Analysis history</Text>
          </View>
        </View>

        {/* Premium Tier Card */}
        <View style={[styles.tierCard, styles.premiumCard, currentTier === SubscriptionTier.PREMIUM && styles.activeTier]}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierName}>PREMIUM</Text>
            {currentTier === SubscriptionTier.PREMIUM && (
              <View style={[styles.activeBadge, styles.activeBadgePremium]}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.tierPrice}>$6.99<Text style={styles.tierPeriod}>/month</Text></Text>
          <Text style={styles.tierYearly}>or $49.99/year (save 40%)</Text>

          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ Unlimited analyses</Text>
            <Text style={styles.featureItem}>✓ All AI providers (Claude, GPT, Gemini)</Text>
            <Text style={styles.featureItem}>✓ Web search component lookup</Text>
            <Text style={styles.featureItem}>✓ Component database access</Text>
            <Text style={styles.featureItem}>✓ Analysis history</Text>
            <Text style={styles.featureItem}>✓ Export to PDF</Text>
            <Text style={styles.featureItemDisabled}>✗ Batch analysis</Text>
            <Text style={styles.featureItemDisabled}>✗ Circuit simulation</Text>
          </View>

          {currentTier !== SubscriptionTier.PREMIUM && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => handleTierChange(SubscriptionTier.PREMIUM)}
            >
              <Text style={styles.upgradeButtonText}>
                {currentTier === SubscriptionTier.FREE
                  ? 'UPGRADE TO PREMIUM'
                  : currentTier === SubscriptionTier.PRO
                  ? 'DOWNGRADE TO PREMIUM'
                  : 'SELECT PREMIUM'}
              </Text>
            </TouchableOpacity>
          )}
          {currentTier === SubscriptionTier.PREMIUM && (
            <View style={styles.currentPlanNote}>
              <Text style={styles.currentPlanNoteText}>✓ Your current plan</Text>
            </View>
          )}
        </View>

        {/* Pro Tier Card */}
        <View style={[styles.tierCard, styles.proCard, currentTier === SubscriptionTier.PRO && styles.activeTier]}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierName}>PRO</Text>
            {currentTier === SubscriptionTier.PRO && (
              <View style={[styles.activeBadge, styles.activeBadgePro]}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.tierPrice}>$14.99<Text style={styles.tierPeriod}>/month</Text></Text>
          <Text style={styles.tierYearly}>or $99.99/year (save 44%)</Text>

          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ Everything in Premium</Text>
            <Text style={styles.featureItem}>✓ Batch analysis (multiple images)</Text>
            <Text style={styles.featureItem}>✓ Circuit simulation suggestions</Text>
            <Text style={styles.featureItem}>✓ Component affiliate links</Text>
            <Text style={styles.featureItem}>✓ Custom component training</Text>
            <Text style={styles.featureItem}>✓ Priority support</Text>
          </View>

          {currentTier !== SubscriptionTier.PRO && (
            <TouchableOpacity
              style={[styles.upgradeButton, styles.upgradeButtonPro]}
              onPress={() => handleTierChange(SubscriptionTier.PRO)}
            >
              <Text style={styles.upgradeButtonText}>
                {currentTier === SubscriptionTier.FREE || currentTier === SubscriptionTier.PREMIUM
                  ? 'UPGRADE TO PRO'
                  : 'SELECT PRO'}
              </Text>
            </TouchableOpacity>
          )}
          {currentTier === SubscriptionTier.PRO && (
            <View style={[styles.currentPlanNote, styles.currentPlanNotePro]}>
              <Text style={styles.currentPlanNoteText}>✓ Your current plan</Text>
            </View>
          )}
        </View>

        {/* Downgrade to Free Option */}
        {currentTier !== SubscriptionTier.FREE && (
          <View style={styles.downgradeSection}>
            <Text style={styles.downgradeSectionTitle}>Cancel Subscription</Text>
            <Text style={styles.downgradeSectionText}>
              If you cancel, you'll lose access to premium features and return to the free tier.
            </Text>
            <TouchableOpacity
              style={styles.downgradeButton}
              onPress={() => handleTierChange(SubscriptionTier.FREE)}
            >
              <Text style={styles.downgradeButtonText}>CANCEL & RETURN TO FREE</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Payment integration coming soon. This is a preview of subscription management.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  currentTierBadge: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#374151',
  },
  currentTierLabel: {
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  currentTierValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    letterSpacing: 1,
  },
  tierCard: {
    backgroundColor: '#111111',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#374151',
  },
  activeTier: {
    borderColor: '#10B981',
  },
  premiumCard: {
    borderColor: '#3B82F6',
  },
  proCard: {
    borderColor: '#F59E0B',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  activeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgePremium: {
    backgroundColor: '#3B82F6',
  },
  activeBadgePro: {
    backgroundColor: '#F59E0B',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tierPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tierPeriod: {
    fontSize: 16,
    color: '#6B7280',
  },
  tierYearly: {
    fontSize: 12,
    color: '#10B981',
    marginBottom: 20,
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
    lineHeight: 20,
  },
  featureItemDisabled: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonPro: {
    backgroundColor: '#F59E0B',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  currentPlanNote: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  currentPlanNotePro: {
    borderColor: '#F59E0B',
  },
  currentPlanNoteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    letterSpacing: 1,
  },
  downgradeSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  downgradeSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  downgradeSectionText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  downgradeButton: {
    backgroundColor: 'transparent',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  downgradeButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF4444',
    letterSpacing: 1,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
