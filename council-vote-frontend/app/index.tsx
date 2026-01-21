import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Navigate to the appropriate tab based on user role
        if (user.role === 'SUPER_ADMIN') {
          router.replace('/(tabs)/admin-dashboard');
        } else if (user.role === 'MODERATOR') {
          router.replace('/(tabs)/mod-positions');
        } else if (user.role === 'CANDIDATE') {
          router.replace('/(tabs)/positions');
        } else {
          // Fallback
          router.replace('/(tabs)/profile');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}