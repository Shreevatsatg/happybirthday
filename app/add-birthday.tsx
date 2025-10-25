import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { BirthdayService } from '@/services/BirthdayService';

export default function AddBirthdayScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSaveBirthday = async () => {
    if (!name) {
      Alert.alert('Missing Information', 'Please enter a name for the birthday.');
      return;
    }

    try {
      const birthdayService = new BirthdayService();
      // TODO: Replace with actual user ID from auth context
      const userId = 'some-user-id';
      await birthdayService.addBirthday(userId, name, date.toISOString().split('T')[0]);
      Alert.alert('Success', 'Birthday added successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to add birthday:', error);
      Alert.alert('Error', 'Failed to add birthday. Please try again.');
    }
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="e.g., John Doe"
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Birthdate</ThemedText>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.icon} />
              <ThemedText style={styles.dateText}>
                {date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </ThemedText>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display="spinner"
              onChange={onDateChange}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: colors.tint, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleSaveBirthday}
          >
            <Ionicons name="save-outline" size={20} color={colors.card} />
            <ThemedText style={[styles.saveButtonText, { color: colors.background}]}>Save Birthday</ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#666',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  dateButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
