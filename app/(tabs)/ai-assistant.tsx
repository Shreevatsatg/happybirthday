import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { generateGiftIdeas, getAIResponse } from '@/services/AIService';

const WISH_STYLES = ['Friendly', 'Funny', 'Romantic', 'Formal'];
const BUDGET_OPTIONS = ['low', 'medium', 'high', 'expensive'];

interface GiftSuggestion {
  id: string;
  name: string;
  description: string;
  url: string;
}

export default function AIAssistantScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [mode, setMode] = useState<'wish' | 'gift'>('wish');
  const [selectedWishStyle, setSelectedWishStyle] = useState(WISH_STYLES[0]);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0]);
  const [name, setName] = useState('');
  const [likes, setLikes] = useState('');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // Separate states for wish and gift modes
  const [generatedWish, setGeneratedWish] = useState('');
  const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestion[]>([]);
  const [isLoadingWish, setIsLoadingWish] = useState(false);
  const [isLoadingGift, setIsLoadingGift] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (params.name) {
      setName(params.name as string);
    }
    if (params.note) {
      setAdditionalInfo(params.note as string);
    }
    if (params.phoneNumber) {
      setPhoneNumber(params.phoneNumber as string);
    }
    if (params.group) {
      const group = params.group as string;
      if (group === 'family') {
        setSelectedWishStyle('Romantic');
      } else if (group === 'friend') {
        setSelectedWishStyle('Friendly');
      } else if (group === 'work') {
        setSelectedWishStyle('Formal');
      } else {
        setSelectedWishStyle('Friendly');
      }
    }
  }, [params]);

  const handleGenerateWish = async () => {
    setIsLoadingWish(true);
    setGeneratedWish('');
    const prompt = `Generate a ${selectedWishStyle} birthday wish for ${name} who likes "${likes}". Additional info: ${additionalInfo}`;
    try {
      const responseText = await getAIResponse(prompt);
      setGeneratedWish(responseText);
    } catch (error) {
      setGeneratedWish((error as Error).message);
    } finally {
      setIsLoadingWish(false);
    }
  };

  const handleSuggestGift = async () => {
    setIsLoadingGift(true);
    setGiftSuggestions([]);
    try {
      const response = await generateGiftIdeas(likes, selectedBudget, additionalInfo);
      const suggestions = response.map((idea, index) => ({
        id: `${index}`,
        name: idea,
        description: '',
        url: `https://www.amazon.com/s?k=${encodeURIComponent(idea)}`,
      }));
      setGiftSuggestions(suggestions);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoadingGift(false);
    }
  };

  const handleGenerate = () => {
    if (mode === 'wish') {
      handleGenerateWish();
    } else {
      handleSuggestGift();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (mode === 'wish' && generatedWish) {
      await handleGenerateWish();
    } else if (mode === 'gift' && giftSuggestions.length > 0) {
      await handleSuggestGift();
    }
    setRefreshing(false);
  };

  const handleCopyWish = () => {
    Clipboard.setString(generatedWish);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWish = async () => {
    try {
      await Share.share({ message: generatedWish });
    } catch (error) {
      // Handle error
    }
  };

  const handleSendSMS = () => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'This contact has no phone number linked.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`sms:${cleanNumber}?body=${encodeURIComponent(generatedWish)}`);
  };

  const handleSendWhatsApp = () => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'This contact has no phone number linked.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(generatedWish)}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'WhatsApp is not installed on your device.');
    });
  };

  const renderWishResult = () => {
    if (isLoadingWish) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText secondary style={styles.loadingText}>Crafting your wish...</ThemedText>
        </View>
      );
    }

    if (generatedWish) {
      return (
        <View style={[styles.wishCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.wishHeader}>
            <ThemedText secondary style={styles.wishLabel}>Your Wish</ThemedText>
            <View style={styles.wishActions}>
              <Pressable onPress={handleCopyWish} style={styles.actionButton} disabled={isCopied}>
                <Ionicons
                  name={isCopied ? 'checkmark' : 'copy-outline'}
                  size={24}
                  color={isCopied ? colors.tint : colors.icon}
                />
              </Pressable>
              <Pressable onPress={handleShareWish} style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={24} color={colors.icon} />
              </Pressable>
              {phoneNumber && (
                <>
                  <Pressable onPress={handleSendSMS} style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={24} color={colors.icon} />
                  </Pressable>
                  <Pressable onPress={handleSendWhatsApp} style={styles.actionButton}>
                    <Ionicons name="logo-whatsapp" size={24} color={colors.icon} />
                  </Pressable>
                </>
              )}
            </View>
          </View>
          <TextInput
            style={[styles.wishText, { color: colors.text, borderColor: colors.border }]}
            value={generatedWish}
            onChangeText={setGeneratedWish}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </View>
      );
    }

    return null;
  };

  const renderGiftResult = () => {
    if (isLoadingGift) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText secondary style={styles.loadingText}>Finding perfect gifts...</ThemedText>
        </View>
      );
    }

    if (giftSuggestions.length > 0) {
      return (
        <View style={styles.giftsContainer}>
          {giftSuggestions.map(gift => (
            <TouchableOpacity
              key={gift.id}
              style={[styles.giftListItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => Linking.openURL(gift.url)}
            >
              <View style={styles.giftTextContainer}>
                <ThemedText style={styles.giftName}>{gift.name}</ThemedText>
                {gift.description && (
                  <ThemedText style={[styles.giftDescription, { color: colors.textSecondary }]}>
                    {gift.description}
                  </ThemedText>
                )}
              </View>
              <Ionicons name="open-outline" size={20} color={colors.tint} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
              colors={[colors.background]}
            />
          }
        >
          {/* Mode Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                mode === 'wish' && { backgroundColor: colors.tint },
                mode !== 'wish' && { backgroundColor: colors.surface },
              ]}
              onPress={() => setMode('wish')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="sparkles"
                size={18}
                color={mode === 'wish' ? colors.card : colors.text}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: mode === 'wish' ? colors.card : colors.text },
                ]}
              >
                Wish
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                mode === 'gift' && { backgroundColor: colors.tint },
                mode !== 'gift' && { backgroundColor: colors.surface },
              ]}
              onPress={() => setMode('gift')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="gift"
                size={18}
                color={mode === 'gift' ? colors.card : colors.text}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: mode === 'gift' ? colors.card : colors.text },
                ]}
              >
                Gift
              </Text>
            </TouchableOpacity>
          </View>

          {/* Results Section - Mode Specific */}
          {mode === 'wish' && renderWishResult()}
          {mode === 'gift' && renderGiftResult()}

          {/* Input Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Personalize
            </ThemedText>
            {mode === 'wish' && (
              <>
                <ThemedText secondary style={styles.label}>
                  Name
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                  ]}
                  placeholder="Enter name"
                  placeholderTextColor={colors.icon}
                  value={name}
                  onChangeText={setName}
                />
              </>
            )}
            {mode === 'wish' && (
              <>
                <ThemedText secondary style={styles.label}>
                  Choose a style
                </ThemedText>
                <View style={styles.styleSelector}>
                  {WISH_STYLES.map((style) => (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.styleButton,
                        {
                          backgroundColor:
                            selectedWishStyle === style
                              ? colors.tint
                              : colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setSelectedWishStyle(style)}
                    >
                      <Text
                        style={{
                          color:
                            selectedWishStyle === style
                              ? colors.card
                              : colors.text,
                          fontSize: 13,
                        }}
                      >
                        {style}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            {mode === 'gift' && (
              <>
                <ThemedText secondary style={styles.label}>
                  Choose a budget
                </ThemedText>
                <View style={styles.styleSelector}>
                  {BUDGET_OPTIONS.map((budget) => (
                    <TouchableOpacity
                      key={budget}
                      style={[
                        styles.styleButton,
                        {
                          backgroundColor:
                            selectedBudget === budget
                              ? colors.tint
                              : colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setSelectedBudget(budget)}
                    >
                      <Text
                        style={{
                          color:
                            selectedBudget === budget
                              ? colors.card
                              : colors.text,
                          fontSize: 13,
                        }}
                      >
                        {budget}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            <ThemedText secondary style={styles.label}>
              What do they like?
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
              ]}
              placeholder="e.g., hiking, reading, dogs"
              placeholderTextColor={colors.icon}
              value={likes}
              onChangeText={setLikes}
            />
            <ThemedText secondary style={styles.label}>
              Additional Information
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
              ]}
              placeholder="e.g., 10th birthday, inside jokes"
              placeholderTextColor={colors.icon}
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionFullButton,
                { backgroundColor: colors.tint },
              ]}
              onPress={handleGenerate}
              disabled={isLoadingWish || isLoadingGift}
            >
              <ThemedText style={{ color: colors.card, fontWeight: '600', fontSize: 16 }}>
                {mode === 'wish' ? 'Generate Wish' : 'Suggest Gift'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'transparent',
    padding: 4,
    borderRadius: 12,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  wishCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  wishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wishLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  wishActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  wishText: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  giftsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  giftListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  giftTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  giftName: {
    fontSize: 15,
    fontWeight: '600',
  },
  giftDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  styleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  actionFullButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
});