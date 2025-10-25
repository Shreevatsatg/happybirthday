import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';

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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.name}>{birthday.name}</ThemedText>
        <ThemedText style={styles.group}>{birthday.group}</ThemedText>
      </View>
      <View style={styles.content}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={20} color={colors.icon} />
          <ThemedText>{new Date(birthday.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="gift-outline" size={20} color={colors.icon} />
          <ThemedText>Turns {birthday.age}</ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={20} color={colors.icon} />
          <ThemedText>{birthday.daysLeft} days left</ThemedText>
        </View>
        {birthday.note && (
          <View style={styles.noteContainer}>
            <ThemedText style={styles.noteLabel}>Note</ThemedText>
            <ThemedText style={styles.noteText}>{birthday.note}</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <Pressable style={styles.editButton} onPress={() => router.push({ pathname: '/add-birthday', params: { id: birthday.id } })}>
          <Ionicons name="pencil-outline" size={20} color={colors.tint} />
          <ThemedText style={{ color: colors.tint }}>Edit</ThemedText>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => setIsDeleteModalVisible(true)}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <ThemedText style={{ color: colors.error }}>Delete</ThemedText>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => {
          setIsDeleteModalVisible(!isDeleteModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.modalText}>Are you sure you want to delete this birthday?</ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, { backgroundColor: colors.border }]}
                onPress={() => setIsDeleteModalVisible(!isDeleteModalVisible)}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: colors.error }]}
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
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  group: {
    fontSize: 18,
    color: 'gray',
  },
  content: {},
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  noteContainer: {
    marginTop: 20,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
});