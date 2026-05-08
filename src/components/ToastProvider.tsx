import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Toast, type ToastType } from '@/components/Toast';

type ToastInput = {
  message: string;
  type?: ToastType;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastInput | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(timer);
  }, [toast]);

  const value = useMemo(
    () => ({
      showToast: (nextToast: ToastInput) => setToast(nextToast),
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.wrap}>
        {children}
        <Toast visible={!!toast} message={toast?.message ?? ''} type={toast?.type} />
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }
  return context;
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
});
