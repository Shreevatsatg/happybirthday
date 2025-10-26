import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';

export default function BirthdayDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { birthdays, deleteBirthday } = useBirthdays();
  const router = useRouter();
  const { colors } = useTheme();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const birthday = birthdays.find(b => b.id === Number(id));

  if (!birthday) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Birthday not found.</ThemedText>
      </ThemedView>
    );
  }

  const handleDelete = async () => {
    if (birthday) {
      await deleteBirthday(birthday.id);
      router.back();
    }
  };

  const handleCall = () => {
    const phoneNumber = birthday.contact_phone_number;
    if (!phoneNumber) {
      Alert.alert('No Contact', 'No phone number is linked to this birthday.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleSMS = () => {
    const phoneNumber = birthday.contact_phone_number;
    if (!phoneNumber) {
      Alert.alert('No Contact', 'No phone number is linked to this birthday.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`sms:${cleanNumber}`);
  };

  const handleWhatsApp = () => {
    const phoneNumber = birthday.contact_phone_number;
    if (!phoneNumber) {
      Alert.alert('No Contact', 'No phone number is linked to this birthday.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanNumber}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'WhatsApp is not installed on your device.');
    });
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft === 0) return colors.error;
    if (daysLeft <= 7) return '#FFA500';
    return '#4CAF50';
  };

  const hasPhoneNumber = birthday.contact_phone_number;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: `${colors.accent}20` }]}>
            <ThemedText style={[styles.avatarText, { color: colors.tint }]}>
              {birthday.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText style={styles.name}>{birthday.name}</ThemedText>
          <ThemedText style={styles.group}>{birthday.group ? (birthday.group.charAt(0).toUpperCase() + birthday.group.slice(1)) : ''}</ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={24} color={colors.icon} />
            <View style={styles.detailTextContainer}>
              <ThemedText style={styles.detailLabel}>Birthday</ThemedText>
              <ThemedText style={styles.detailValue}>{new Date(birthday.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</ThemedText>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="gift-outline" size={24} color={colors.icon} />
            <View style={styles.detailTextContainer}>
              <ThemedText style={styles.detailLabel}>Age</ThemedText>
              <ThemedText style={styles.detailValue}>Turns {birthday.age}</ThemedText>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={24} color={colors.icon} />
            <View style={styles.detailTextContainer}>
              <ThemedText style={styles.detailLabel}>Days Left</ThemedText>
              <ThemedText style={[styles.detailValue, { color: getUrgencyColor(birthday.daysLeft!) }]}>{birthday.daysLeft} days</ThemedText>
            </View>
          </View>
        </View>

        {birthday.note && (
          <View style={[styles.noteCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.noteLabel}>Note</ThemedText>
            <ThemedText style={styles.noteText}>{birthday.note}</ThemedText>
          </View>
        )}

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
            {hasPhoneNumber ? (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleCall}
                >
                  <Ionicons name="call" size={24} color="#4CAF50" />
                  <ThemedText style={styles.actionButtonText}>Call</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleSMS}
                >
                  <Ionicons name="chatbubble" size={24} color="#2196F3" />
                  <ThemedText style={styles.actionButtonText}>SMS</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleWhatsApp}
                >
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                  <ThemedText style={styles.actionButtonText}>WhatsApp</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyActionsContainer}>
                <ThemedText style={styles.emptyActionsText}>No contact linked</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: 'transparent'}]}>
        <Pressable style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.7 : 1, backgroundColor: colors.surface, borderColor: colors.text }]} onPress={() => router.push({ pathname: '/add-birthday', params: { id: birthday.id } })}>
          <Ionicons name="pencil-outline" size={22} color={colors.tint} />
          <ThemedText style={[styles.buttonText, { color: colors.tint }]}>Edit</ThemedText>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.7 : 1, backgroundColor: colors.error }]} onPress={() => setIsDeleteModalVisible(true)}>
          <Ionicons name="trash-outline" size={22} color={colors.card} />
          <ThemedText style={[styles.buttonText, { color: colors.card }]}>Delete</ThemedText>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.modalText}>Are you sure you want to delete this birthday?</ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDelete}
              >
                <ThemedText style={{ color: colors.background }}>Delete</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  emptyActionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyActionsText: {
    fontSize: 16,
    color: 'gray',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    padding: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  group: {
    fontSize: 18,
    color: 'gray',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailTextContainer: {
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  noteCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
});
