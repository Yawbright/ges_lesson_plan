import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function getWebStorage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export const appStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return getWebStorage()?.getItem(key) ?? null;
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      getWebStorage()?.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      getWebStorage()?.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};
