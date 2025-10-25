import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';

const groups = ['family', 'friend', 'work', 'other'];

export default function AddBirthdayScreen() {
  const { id } = useLocalSearchParams();
  const { addBirthday, updateBirthday, birthdays } = useBirthdays();
  const { colors } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [group, setGroup] = useState<'family' | 'friend' | 'work' | 'other'>('friend');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isEditMode = id !== undefined;

  useEffect(() => {
    if (isEditMode) {
      const birthdayToEdit = birthdays.find(b => b.id === Number(id));
      if (birthdayToEdit) {
        setName(birthdayToEdit.name);
        setDate(new Date(birthdayToEdit.date));
        setNote(birthdayToEdit.note || '');
        setGroup(birthdayToEdit.group || 'friend');
      }
    }
  }, [id, isEditMode, birthdays]);

  const handleSaveOrUpdate = async () => {
    if (!name) {
      Alert.alert('Missing Information', 'Please enter a name for the birthday.');
      return;
    }

    try {
      if (isEditMode) {
        const birthdayToUpdate = birthdays.find(b => b.id === Number(id));
        if (birthdayToUpdate) {
          await updateBirthday({ ...birthdayToUpdate, name, date: date.toISOString().split('T')[0], note, group });
          Alert.alert('Success', 'Birthday updated successfully!');
        }
      } else {
        await addBirthday(name, date.toISOString().split('T')[0], note, group);
        Alert.alert('Success', 'Birthday added successfully!');
      }
      router.back();
    } catch (error) {
      console.error('Failed to save birthday:', error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} birthday. Please try again.`);
    }
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 90} // Adjust offset for better visibility
      >
        <ScrollView
          style={[styles.form, { backgroundColor: colors.background }]}
          contentContainerStyle={{ paddingBottom: 20 }} // Ensure scrollable content has padding
          keyboardShouldPersistTaps="handled" // Handle taps to dismiss keyboard
        >
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

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Group</ThemedText>
            <View style={styles.groupContainer}>
              {groups.map((g) => (
                <Pressable
                  key={g}
                  style={[
                    styles.groupButton,
                    {
                      backgroundColor: group === g ? colors.tint : colors.surface,
                      borderColor: group === g ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setGroup(g as any)}
                >
                  <ThemedText style={{ color: group === g ? colors.background : colors.text }}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Note</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="e.g., Gift ideas, how you met..."
              placeholderTextColor={colors.icon}
              multiline
            />
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
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: colors.tint, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleSaveOrUpdate}
          >
            <Ionicons name="save-outline" size={20} color={colors.card} />
            <ThemedText style={[styles.saveButtonText, { color: colors.background }]}>
              {isEditMode ? 'Update Birthday' : 'Save Birthday'}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
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
  groupContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  groupButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 10,
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
  },
});