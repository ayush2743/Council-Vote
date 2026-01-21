import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, FileText, Vote, Trophy, ChevronRight, Zap } from 'lucide-react-native';
import { candidateService } from '../../services/candidateService';
import { COLORS } from '../../constants/colors';

export default function DashboardScreen() {
  const [activeCount, setActiveCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    const [activeRes, appliedRes, liveRes] = await Promise.all([
      candidateService.getAvailablePositions(),
      candidateService.getMyApplications(),
      candidateService.getLivePositions(),
    ]);

    setIsLoading(false);

    if (!activeRes.error && activeRes.data) {
      const positions = (activeRes.data as any).positions || activeRes.data;
      setActiveCount(Array.isArray(positions) ? positions.length : 0);
    }

    if (!appliedRes.error && appliedRes.data) {
      const applications = (appliedRes.data as any).applications || appliedRes.data;
      setAppliedCount(Array.isArray(applications) ? applications.length : 0);
    }

    if (!liveRes.error && liveRes.data) {
      const positions = (liveRes.data as any).positions || liveRes.data;
      setLiveCount(Array.isArray(positions) ? positions.length : 0);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    onPress,
  }: {
    icon: any;
    label: string;
    value: number;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 24,
            backgroundColor: color + '20',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon size={18} color={color} />
        </View>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              marginBottom: 4,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: COLORS.text,
            }}
          >
            {value}
          </Text>
        </View>
      </View>
      {onPress && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: color,
              fontWeight: '600',
              marginRight: 4,
            }}
          >
            View Details
          </Text>
          <ChevronRight size={16} color={color} />
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
            marginBottom: 4,
          }}
        >
          Dashboard
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        <StatCard
          icon={Briefcase}
          label="Active Positions"
          value={activeCount}
          color={COLORS.primary}
          onPress={() => router.push('/(tabs)/positions')}
        />

        <StatCard
          icon={FileText}
          label="Applied Positions"
          value={appliedCount}
          color={COLORS.info}
          onPress={() => router.push('/(tabs)/positions')}
        />

        <StatCard
          icon={Zap}
          label="Live Positions"
          value={liveCount}
          color={COLORS.success}
          onPress={() => router.push('/(tabs)/positions')}
        />

        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: 20,
            marginTop: 8,
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
            Quick Actions
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: COLORS.background,
              borderRadius: 12,
              marginBottom: 12,
            }}
            onPress={() => router.push('/(tabs)/vote')}
          >
            <Vote size={24} color={COLORS.success} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>
                Cast Your Vote
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                Vote for live positions
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: COLORS.background,
              borderRadius: 12,
            }}
            onPress={() => router.push('/(tabs)/results')}
          >
            <Trophy size={24} color={COLORS.warning} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>
                View Results
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                Check election results
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
