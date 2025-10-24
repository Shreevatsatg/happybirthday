import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { BirthdayService } from '@/services/BirthdayService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddBirthdayScreen() {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const { colors } = useTheme();

  const handleSaveBirthday = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a name for the birthday.');
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
      Alert.alert('Error', 'Failed to add birthday. Please try again.');
    }
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView surface style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            style={[styles.input, { 
              borderColor: colors.border, 
              color: colors.text,
              backgroundColor: colors.surface 
            }]}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textSecondary}
            placeholder="Enter name"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Birthdate</ThemedText>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateButton, { 
              backgroundColor: colors.primary + '15',
              borderColor: colors.primary
            }]}
          >
            <ThemedText style={{ color: colors.primary }}>
              {date.toLocaleDateString()}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        )}
      </ThemedView>

      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSaveBirthday}
      >
        <ThemedText style={[styles.saveButtonText, { color: colors.surface }]}>
          Save Birthday
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  dateButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 10,
  },
});
