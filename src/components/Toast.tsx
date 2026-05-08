import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type ToastType = 'success' | 'error';

interface Props {
  visible: boolean;
  message: string;
  type?: ToastType;
}

export function Toast({ visible, message, type = 'success' }: Props) {
  if (!visible || !message) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        type === 'success' ? styles.successWrap : styles.errorWrap,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    zIndex: 50,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  successWrap: {
    backgroundColor: colors.primary,
  },
  errorWrap: {
    backgroundColor: colors.danger,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
