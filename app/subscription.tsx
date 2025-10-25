
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { Pressable, StyleSheet, View } from 'react-native';

export default function SubscriptionScreen() {
  const { colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.benefitText}>
          Subscribe to unlock premium features:
        </ThemedText>
        <View style={styles.featureList}>
          <ThemedText style={styles.featureItem}>- Unlimited AI Assistant messages</ThemedText>
          <ThemedText style={styles.featureItem}>- Cloud backup and sync</ThemedText>
          <ThemedText style={styles.featureItem}>- Exclusive themes</ThemedText>
        </View>

        <View style={styles.subscriptionOptions}>
          <Pressable style={[styles.option, { borderColor: colors.border }]}>
            <ThemedText style={styles.optionTitle}>Monthly</ThemedText>
            <ThemedText style={styles.optionPrice}>$1.99 / month</ThemedText>
          </Pressable>
          <Pressable style={[styles.option, { borderColor: colors.primary, borderWidth: 2 }]}>
            <ThemedText style={styles.optionTitle}>Annual</ThemedText>
            <ThemedText style={styles.optionPrice}>$19.99 / year</ThemedText>
            <View style={styles.bestValueContainer}>
              <ThemedText style={styles.bestValueText}>Best Value</ThemedText>
            </View>
          </Pressable>
        </View>

        <Pressable style={[styles.button, { backgroundColor: colors.primary }]}>
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>Subscribe</ThemedText>
        </Pressable>
        <Pressable style={[styles.button, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.buttonText, { color: colors.text }]}>Restore Purchases</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  benefitText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  featureList: {
    marginBottom: 30,
  },
  featureItem: {
    fontSize: 16,
    marginBottom: 10,
  },
  subscriptionOptions: {
    marginBottom: 30,
  },
  option: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionPrice: {
    fontSize: 16,
  },
  bestValueContainer: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bestValueText: {
    color: '#000',
    fontWeight: 'bold',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
