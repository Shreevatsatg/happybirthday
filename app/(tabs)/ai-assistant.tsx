import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Linking,
  Pressable,
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

type ResultType = 'wish' | 'gifts' | null;

export default function AIAssistantScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [mode, setMode] = useState('wish'); // 'wish' or 'gift'
  const [selectedWishStyle, setSelectedWishStyle] = useState(WISH_STYLES[0]);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0]);
  const [name, setName] = useState('');
  const [likes, setLikes] = useState('');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generatedWish, setGeneratedWish] = useState('');
  const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultType, setResultType] = useState<ResultType>(null);

  useEffect(() => {
    if (params.name) {
      setName(params.name as string);
    }
    if (params.note) {
      setLikes(params.note as string);
    }
    if (params.phoneNumber) {
      setPhoneNumber(params.phoneNumber as string);
    }
  }, [params]);

  const handleGenerateWish = async () => {
    setIsLoading(true);
    setResultType('wish');
    setGeneratedWish('');
    const prompt = `Generate a ${selectedWishStyle} birthday wish for ${name} who likes "${likes}". Additional info: ${additionalInfo}`;
    try {
      const responseText = await getAIResponse(prompt);
      setGeneratedWish(responseText);
    } catch (error) {
      setGeneratedWish((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestGift = async () => {
    setIsLoading(true);
    setResultType('gifts');
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
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    if (mode === 'wish') {
      handleGenerateWish();
    } else {
      handleSuggestGift();
    }
  };

  const handleCopyWish = () => {
    Clipboard.setString(generatedWish);
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

  const renderResult = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />;
    }

    if (resultType === 'wish' && generatedWish) {
      return (
        <View style={[styles.wishCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <ThemedText style={styles.wishText}>{generatedWish}</ThemedText>
          <View style={styles.wishActions}>
            <Pressable onPress={handleCopyWish} style={styles.actionButton}>
              <Ionicons name="copy-outline" size={24} color={colors.icon} />
            </Pressable>
            <Pressable onPress={handleShareWish} style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color={colors.icon} />
            </Pressable>
            <Pressable onPress={handleSendSMS} style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color={colors.icon} />
            </Pressable>
            <Pressable onPress={handleSendWhatsApp} style={styles.actionButton}>
              <Ionicons name="logo-whatsapp" size={24} color={colors.icon} />
            </Pressable>
          </View>
        </View>
      );
    }

    if (resultType === 'gifts' && giftSuggestions.length > 0) {
      return (
        <View style={{ marginTop: 20 }}>
          {giftSuggestions.map(gift => (
            <TouchableOpacity
              key={gift.id}
              style={[styles.giftListItem, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => Linking.openURL(gift.url)}
            >
              <View style={styles.giftTextContainer}>
                <ThemedText style={styles.giftName}>{gift.name}</ThemedText>
                <ThemedText style={[styles.giftDescription, { color: colors.textSecondary }]}>
                  {gift.description}
                </ThemedText>
              </View>
              <Ionicons name="open-outline" size={24} color={colors.tint} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            <Text style={[
              styles.toggleText,
              { color: mode === 'wish' ? colors.card : colors.text },
            ]}>
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
            <Text style={[
              styles.toggleText,
              { color: mode === 'gift' ? colors.card : colors.text },
            ]}>
              Gift
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Personalize
          </ThemedText>
          {mode === 'wish' && (
            <>
              <ThemedText secondary style={styles.label}>
                Name
              </ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
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
                {WISH_STYLES.map(style => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.styleButton,
                      {
                        backgroundColor: selectedWishStyle === style ? colors.tint : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedWishStyle(style)}
                  >
                    <Text style={{ color: selectedWishStyle === style ? colors.card : colors.text }}>
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
                {BUDGET_OPTIONS.map(budget => (
                  <TouchableOpacity
                    key={budget}
                    style={[
                      styles.styleButton,
                      {
                        backgroundColor: selectedBudget === budget ? colors.tint : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedBudget(budget)}
                  >
                    <Text style={{ color: selectedBudget === budget ? colors.card : colors.text }}>
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
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., hiking, reading, dogs"
            placeholderTextColor={colors.icon}
            value={likes}
            onChangeText={setLikes}
          />
          <ThemedText secondary style={styles.label}>
            Additional Information
          </ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., 10th birthday, inside jokes"
            placeholderTextColor={colors.icon}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionFullButton, { backgroundColor: colors.tint }]}
            onPress={handleGenerate}
            disabled={isLoading}
          >
            <ThemedText style={{ color: colors.card, fontWeight: 'bold' }}>
              {mode === 'wish' ? 'Generate Wish' : 'Suggest Gift'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        <View style={styles.resultsContainer}>{renderResult()}</View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
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
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  styleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  styleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  actionFullButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  wishCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  wishText: {
    fontSize: 16,
    lineHeight: 24,
  },
  wishActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  giftListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  giftTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  giftName: {
    fontSize: 16,
    fontWeight: '600',
  },
  giftDescription: {
    fontSize: 14,
    marginTop: 4,
  },
});
