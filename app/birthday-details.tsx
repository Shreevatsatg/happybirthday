import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft === 0) return colors.error;
    if (daysLeft <= 7) return '#FFA500';
    return '#4CAF50';
  };

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
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: 'transparent'}]}>
        <Pressable style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.7 : 1, backgroundColor: colors.surface,borderColor: colors.text }]} onPress={() => router.push({ pathname: '/add-birthday', params: { id: birthday.id } })}>
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