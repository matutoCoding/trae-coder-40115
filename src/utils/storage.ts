import Taro from '@tarojs/taro';

const PREFIX = 'bartender_training_';

export const setStorage = <T>(key: string, value: T): void => {
  try {
    Taro.setStorageSync(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('[Storage] setStorage error:', e);
  }
};

export const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = Taro.getStorageSync(PREFIX + key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('[Storage] getStorage error:', e);
    return defaultValue;
  }
};

export const removeStorage = (key: string): void => {
  try {
    Taro.removeStorageSync(PREFIX + key);
  } catch (e) {
    console.error('[Storage] removeStorage error:', e);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
