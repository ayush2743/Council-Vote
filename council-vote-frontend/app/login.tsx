import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login({ email, password });
    setIsLoading(false);

    if (result.success) {
      // Navigation will be handled by index.tsx based on user role
      router.replace('/');
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 48 }}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '700',
              color: COLORS.text,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Council Vote
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Campus Voting System
          </Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              marginBottom: 8,
              fontWeight: '600',
            }}
          >
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: COLORS.text,
            }}
          />
        </View>

        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              marginBottom: 8,
              fontWeight: '600',
            }}
          >
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textLight}
            secureTextEntry
            style={{
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: COLORS.text,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginBottom: 16,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text
              style={{
                color: COLORS.white,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Login
            </Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text
              style={{
                color: COLORS.primary,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
