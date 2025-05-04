import { logout as logoutAction } from '@/store/authSlice';
import { deleteTokens } from './secureStore';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';

/**
 * Custom hook to handle logout functionality
 * This clears both Redux state and secure storage tokens
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = async () => {
    // Clear tokens from secure storage
    await deleteTokens();
    
    // Clear Redux state
    dispatch(logoutAction());
    
    // Navigate to login screen
    router.replace('/(auth)/login');
  };

  return logout;
};