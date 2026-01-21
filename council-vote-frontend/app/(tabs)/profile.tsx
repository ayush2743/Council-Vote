import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ShieldCheck, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return COLORS.error;
      case 'MODERATOR':
        return COLORS.info;
      case 'CANDIDATE':
        return COLORS.primary;
      default:
        return COLORS.textLight;
    }
  };

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'MODERATOR':
        return 'Moderator';
      case 'CANDIDATE':
        return 'Candidate';
      default:
        return user?.role || 'User';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.white,
          paddingTop: 60,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.borderLight,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: COLORS.text,
          }}
        >
          Profile
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Profile Card */}
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.primaryLight,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 32, color: COLORS.white, fontWeight: '700' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: COLORS.text,
            marginBottom: 4,
          }}
        >
          {user?.name}
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            marginBottom: 12,
          }}
        >
          {user?.email}
        </Text>

        <View
          style={{
            backgroundColor: getRoleBadgeColor(),
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'uppercase',
            }}
          >
            {getRoleDisplayName()}
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: COLORS.text,
            marginBottom: 16,
          }}
        >
          Account Information
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.borderLight,
          }}
        >
          <Mail size={20} color={COLORS.primary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.textSecondary,
                marginBottom: 2,
              }}
            >
              Email
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.text }}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
          }}
        >
          <ShieldCheck size={20} color={COLORS.primary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.textSecondary,
                marginBottom: 2,
              }}
            >
              Role
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.text }}>
              {getRoleDisplayName()}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: COLORS.error,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogOut size={20} color={COLORS.white} />
          <Text
            style={{
              color: COLORS.white,
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8,
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
