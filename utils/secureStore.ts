import * as SecureStore from 'expo-secure-store';

// Keys for storing tokens
export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

// Save token to secure storage
export const saveToken = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Get token from secure storage
export const getToken = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Delete token from secure storage
export const deleteToken = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error deleting token:', error);
  }
};

// Save both access and refresh tokens
export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  await saveToken(SECURE_STORE_KEYS.ACCESS_TOKEN, accessToken);
  await saveToken(SECURE_STORE_KEYS.REFRESH_TOKEN, refreshToken);
};

// Delete both tokens (for logout)
export const deleteTokens = async (): Promise<void> => {
  await deleteToken(SECURE_STORE_KEYS.ACCESS_TOKEN);
  await deleteToken(SECURE_STORE_KEYS.REFRESH_TOKEN);
};