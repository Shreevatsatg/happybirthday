import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSignUp = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Please check your email for a confirmation link.' });
    }
    setLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>create an account to sync your data to the cloud</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={colors.icon}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setMessage(null)}
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="********"
              placeholderTextColor={colors.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setMessage(null)}
            />
          </View>
        </View>

        <View style={styles.footer}>
          {message && (
            <Text
              style={[
                styles.message,
                { color: message.type === 'success' ? colors.success : colors.error },
              ]}>
              {message.text}
            </Text>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.tint, opacity: pressed || loading ? 0.7 : 1 },
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.card} />
            <ThemedText style={[styles.buttonText, { color: colors.card }]}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </ThemedText>
          </Pressable>
          <Pressable
            style={{ marginTop: 24 }}
            onPress={() => router.push('/login')}
          >
            <ThemedText style={{ textAlign: 'center', fontSize: 14 }}>
              Already have an account? 
              <ThemedText style={{ color: colors.tint, fontWeight: '600' }}> Login</ThemedText>
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  message: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
