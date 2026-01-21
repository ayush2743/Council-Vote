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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await signup({ name, email, password });
    setIsLoading(false);

    if (result.success) {
      // Navigation will be handled by index.tsx based on user role
      router.replace('/');
    } else {
      Alert.alert('Signup Failed', result.error || 'Could not create account');
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
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Join the voting system
          </Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              marginBottom: 8,
              fontWeight: '600',
            }}
          >
            Full Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={COLORS.textLight}
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

        <View style={{ marginBottom: 20 }}>
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

        <View style={{ marginBottom: 20 }}>
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

        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              marginBottom: 8,
              fontWeight: '600',
            }}
          >
            Confirm Password
          </Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
          onPress={handleSignup}
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
              Sign Up
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
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text
              style={{
                color: COLORS.primary,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
