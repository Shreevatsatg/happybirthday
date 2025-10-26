
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

export const ImportContactDrawer = ({ isVisible, onClose, onImport, onLink }) => {
  const { colors } = useTheme();
  const panY = useRef(new Animated.Value(300)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(panY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(panY, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: colors.surface, transform: [{ translateY: panY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        <ThemedText type="subtitle" style={styles.title}>
          Connect Contact
        </ThemedText>
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            onImport();
            onClose();
          }}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.optionText}>Import user data only</ThemedText>
          <Ionicons name="person-add-outline" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            onLink();
            onClose();
          }}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.optionText}>Import user data and link number</ThemedText>
          <Ionicons name="link-outline" size={18} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
