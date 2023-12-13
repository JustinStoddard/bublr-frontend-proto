
// Get data from Local Storage
export const getLocalStorageItem = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue ?? null;
  } catch (error) {
    console.error('Error retrieving data from localStorage:', error);
    return defaultValue ?? null;
  }
};

// Set data in Local Storage
export const setLocalStorageItem = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting data in localStorage:', error);
  }
};