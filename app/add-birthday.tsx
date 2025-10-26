import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Contacts from 'expo-contacts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';

const groups = ['family', 'friend', 'work', 'other'];

export default function AddBirthdayScreen() {
  const { id, date: dateParam } = useLocalSearchParams<{ id?: string; date?: string }>();
  const { addBirthday, updateBirthday, birthdays } = useBirthdays();
  const { colors } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [note, setNote] = useState('');
  const [group, setGroup] = useState<'family' | 'friend' | 'work' | 'other'>('friend');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [linkedContactId, setLinkedContactId] = useState<string | null>(null);
  const [contactPhoneNumber, setContactPhoneNumber] = useState<string | null>(null);

  const isEditMode = id !== undefined;

  useEffect(() => {
    if (dateParam && !isEditMode) {
      const [year, month, day] = (dateParam as string).split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      setDate(localDate);
    }
  }, [dateParam, isEditMode]);

  useEffect(() => {
    if (isEditMode && id) {
      const birthdayToEdit = birthdays.find(b => b.id === Number(id));
      if (birthdayToEdit) {
        setName(birthdayToEdit.name);
        setNote(birthdayToEdit.note || '');
        setGroup(birthdayToEdit.group || 'friend');
        setLinkedContactId(birthdayToEdit.linked_contact_id || null);
        setContactPhoneNumber(birthdayToEdit.contact_phone_number || null);
        
        const [year, month, day] = birthdayToEdit.date.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        setDate(localDate);
      }
    }
  }, [isEditMode, id, birthdays]);

  const handleConnectContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      try {
        const result = await Contacts.presentContactPickerAsync();
        
        if (result) {
          const contact = result;
          
          // Set the name if available
          if (contact.name) {
            setName(contact.name);
          }
          
          // Set the birthday if available
          if (contact.birthday) {
            const { month, day, year } = contact.birthday;
            if (month !== undefined && day !== undefined) {
              const birthdayYear = year !== undefined ? year : new Date().getFullYear();
              const birthdayDate = new Date(birthdayYear, month - 1, day);
              setDate(birthdayDate);
            }
          }
        }
      } catch (error) {
        console.error('Error picking contact:', error);
        Alert.alert('Error', 'Failed to select contact. Please try again.');
      }
    } else {
      Alert.alert('Permission denied', 'You need to grant contact permissions to use this feature.');
    }
  };

  const handleLinkContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      try {
        const result = await Contacts.presentContactPickerAsync();
        
        if (result) {
          const contact = result;
          
          // Store contact ID
          setLinkedContactId(contact.id);

          // Set the name if available
          if (contact.name) {
            setName(contact.name);
          }
          
          // Get phone number if available
          if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            setContactPhoneNumber(contact.phoneNumbers[0].number || null);
            Alert.alert('Success', `Linked to ${contact.name || 'contact'}`);
          } else {
            Alert.alert('No Phone Number', 'This contact has no phone number saved.');
          }

          // Set the birthday if available
          if (contact.birthday) {
            const { month, day, year } = contact.birthday;
            if (month !== undefined && day !== undefined) {
              const birthdayYear = year !== undefined ? year : new Date().getFullYear();
              const birthdayDate = new Date(birthdayYear, month - 1, day);
              setDate(birthdayDate);
            }
          }
        }
      } catch (error) {
        console.error('Error linking contact:', error);
        Alert.alert('Error', 'Failed to link contact. Please try again.');
      }
    } else {
      Alert.alert('Permission denied', 'You need to grant contact permissions to use this feature.');
    }
  };

  const handleCall = () => {
    if (!contactPhoneNumber) {
      Alert.alert('No Contact', 'Please link a contact first to make a call.');
      return;
    }
    const phoneNumber = contactPhoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSMS = () => {
    if (!contactPhoneNumber) {
      Alert.alert('No Contact', 'Please link a contact first to send SMS.');
      return;
    }
    const phoneNumber = contactPhoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleWhatsApp = () => {
    if (!contactPhoneNumber) {
      Alert.alert('No Contact', 'Please link a contact first to message on WhatsApp.');
      return;
    }
    const phoneNumber = contactPhoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'WhatsApp is not installed on your device.');
    });
  };

  const showContactOptions = () => {
    Alert.alert(
      'Contact Options',
      'Choose how to connect',
      [
        {
          text: 'Call',
          onPress: handleCall,
        },
        {
          text: 'SMS',
          onPress: handleSMS,
        },
        {
          text: 'WhatsApp',
          onPress: handleWhatsApp,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleSaveOrUpdate = async () => {
    if (!name) {
      Alert.alert('Missing Information', 'Please enter a name for the birthday.');
      return;
    }

    if (!date) {
      Alert.alert('Missing Information', 'Please select a birthdate.');
      return;
    }

    Keyboard.dismiss();

    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      if (isEditMode) {
        const birthdayToUpdate = birthdays.find(b => b.id === Number(id));
        if (birthdayToUpdate) {
          await updateBirthday({
            ...birthdayToUpdate,
            name,
            date: formattedDate,
            note,
            group,
            linked_contact_id: linkedContactId ?? undefined,
            contact_phone_number: contactPhoneNumber ?? undefined,
          });
          Alert.alert('Success', 'Birthday updated successfully!');
        }
      } else {
        await addBirthday(name, formattedDate, note, group, linkedContactId ?? undefined, contactPhoneNumber ?? undefined);
        Alert.alert('Success', 'Birthday added successfully!');
      }
      router.back();
    } catch (error) {
      console.error('Failed to save birthday:', error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} birthday. Please try again.`);
    }
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={[styles.form, { backgroundColor: colors.background }]}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <Pressable onPress={handleConnectContact}>
                <Ionicons name="person-add-outline" size={24} color={colors.tint} />
              </Pressable>
            </View>
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
              <ThemedText style={[styles.dateText, { color: date ? colors.text : colors.icon }]}>
                {date
                  ? date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Select a date'}
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

          {/* Contact Connection Section */}
          <View style={styles.contactConnectionSection}>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <ThemedText style={[styles.dividerText, { color: colors.icon }]}>
                Quick Actions
              </ThemedText>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.contactActionsContainer}>
              {linkedContactId ? (
                <View style={styles.actionButtonsRow}>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={handleCall}
                  >
                    <Ionicons name="call" size={24} color="#4CAF50" />
                    <ThemedText style={styles.actionButtonText}>Call</ThemedText>
                  </Pressable>

                  <Pressable
                    style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={handleSMS}
                  >
                    <Ionicons name="chatbubble" size={24} color="#2196F3" />
                    <ThemedText style={styles.actionButtonText}>SMS</ThemedText>
                  </Pressable>

                  <Pressable
                    style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={handleWhatsApp}
                  >
                    <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                    <ThemedText style={styles.actionButtonText}>WhatsApp</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[
                    styles.linkContactButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={handleLinkContact}
                >
                  <Ionicons name="link" size={24} color={colors.tint} />
                  <View style={styles.linkContactTextContainer}>
                    <ThemedText style={styles.linkContactTitle}>Link Contact</ThemedText>
                    <ThemedText style={[styles.linkContactSubtitle, { color: colors.icon }]}>
                      Connect to call, message, or WhatsApp
                    </ThemedText>
                  </View>
                </Pressable>
              )}
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date || new Date()}
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
    </SafeAreaProvider>
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
  contactConnectionSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  contactActionsContainer: {
    gap: 12,
  },
  linkContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  linkContactTextContainer: {
    flex: 1,
  },
  linkContactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  linkContactSubtitle: {
    fontSize: 13,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    padding: 10,
    paddingBottom: 20,
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
