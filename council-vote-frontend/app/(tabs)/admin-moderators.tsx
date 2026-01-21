import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Info, ShieldCheck, CheckCircle, Crown } from 'lucide-react-native';
import { adminService } from '../../services/adminService';
import { COLORS } from '../../constants/colors';

interface Moderator {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminModeratorsScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadModerators();
  }, []);

  const loadModerators = async () => {
    setIsLoading(true);
    const response = await adminService.getModerators();
    setIsLoading(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else if (response.data) {
      const mods = (response.data as any).moderators || response.data;
      setModerators(Array.isArray(mods) ? mods : []);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadModerators();
    setIsRefreshing(false);
  };

  const handleCreateModerator = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    Alert.alert(
      'Create Moderator',
      `Create moderator account for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            setIsCreating(true);
            const response = await adminService.createModerator({
              name,
              email,
              password,
            });
            setIsCreating(false);

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Moderator account created successfully!');
              setName('');
              setEmail('');
              setPassword('');
              loadModerators(); // Reload moderators list
            }
          },
        },
      ]
    );
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
          Moderators
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* All Moderators Section */}
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
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
              All Moderators & Admins
            </Text>

            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : moderators.length === 0 ? (
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                  paddingVertical: 20,
                }}
              >
                No moderators found
              </Text>
            ) : (
              moderators.map((moderator, index) => (
                <View
                  key={moderator.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: index < moderators.length - 1 ? 1 : 0,
                    borderBottomColor: COLORS.borderLight,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: moderator.role === 'SUPER_ADMIN' ? COLORS.error + '20' : COLORS.info + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    {moderator.role === 'SUPER_ADMIN' ? (
                      <Crown size={20} color={COLORS.error} />
                    ) : (
                      <ShieldCheck size={20} color={COLORS.info} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: COLORS.text,
                        marginBottom: 2,
                      }}
                    >
                      {moderator.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.textSecondary,
                      }}
                    >
                      {moderator.email}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: moderator.role === 'SUPER_ADMIN' 
                        ? COLORS.error + '20' 
                        : COLORS.info + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: moderator.role === 'SUPER_ADMIN' ? COLORS.error : COLORS.info,
                        textTransform: 'uppercase',
                      }}
                    >
                      {moderator.role === 'SUPER_ADMIN' ? 'Admin' : 'Moderator'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View
            style={{
              backgroundColor: COLORS.info + '15',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Info
              size={20}
              color={COLORS.info}
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.text,
                  marginBottom: 4,
                  fontWeight: '600',
                }}
              >
                Moderator Permissions
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                  lineHeight: 18,
                }}
              >
                Moderators can create positions and review candidate applications.
                They need 2 moderators to approve/reject each candidate.
              </Text>
            </View>
          </View>

        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                marginBottom: 8,
                fontWeight: '600',
              }}
            >
              Full Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor={COLORS.textLight}
              style={{
                backgroundColor: COLORS.background,
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
              Email Address *
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="moderator@example.com"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                backgroundColor: COLORS.background,
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
              Password *
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
              style={{
                backgroundColor: COLORS.background,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: COLORS.text,
              }}
            />
            <Text
              style={{
                fontSize: 11,
                color: COLORS.textLight,
                marginTop: 6,
              }}
            >
              Minimum 6 characters
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCreateModerator}
            disabled={isCreating}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              opacity: isCreating ? 0.6 : 1,
            }}
          >
            {isCreating ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <ShieldCheck size={20} color={COLORS.white} />
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 8,
                  }}
                >
                  Create Moderator Account
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: 20,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: COLORS.text,
              marginBottom: 12,
            }}
          >
            Moderator Responsibilities
          </Text>

          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <CheckCircle
                size={20}
                color={COLORS.success}
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 20,
                }}
              >
                Create positions with application deadlines
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <CheckCircle
                size={20}
                color={COLORS.success}
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 20,
                }}
              >
                Review and approve/reject candidate applications
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <CheckCircle
                size={20}
                color={COLORS.success}
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 20,
                }}
              >
                Two moderators must approve/reject each candidate
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: COLORS.error + '10',
              padding: 12,
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: COLORS.error,
                marginBottom: 4,
              }}
            >
              Limitations:
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
              Moderators cannot set voting schedules or publish results. Only
              super admins can perform these actions.
            </Text>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
