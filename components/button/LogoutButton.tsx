import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLogout } from '@/utils/auth';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface LogoutButtonProps {
  style?: any;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ style }) => {
  const logout = useLogout();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={logout}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{t('auth.logout')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LogoutButton;