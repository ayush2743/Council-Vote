import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { candidateService } from '../../services/candidateService';
import { COLORS } from '../../constants/colors';
import type { CandidateProposal } from '../../types';

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<CandidateProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    const response = await candidateService.getMyApplications();
    setIsLoading(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else if (response.data) {
      const applications = (response.data as any).applications || response.data;
      setApplications(Array.isArray(applications) ? applications : []);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadApplications();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'time';
      case 'APPROVED':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return COLORS.pending;
      case 'APPROVED':
        return COLORS.approved;
      case 'REJECTED':
        return COLORS.rejected;
      default:
        return COLORS.textLight;
    }
  };

  const renderApplication = ({ item }: { item: CandidateProposal }) => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(item.status),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: COLORS.text,
              marginBottom: 4,
            }}
          >
            {item.position?.name || 'Position'}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textLight,
            }}
          >
            Applied on {formatDate(item.createdAt)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getStatusColor(item.status) + '20',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: getStatusColor(item.status),
              marginLeft: 4,
              textTransform: 'uppercase',
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: COLORS.background,
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
            lineHeight: 20,
          }}
          numberOfLines={3}
        >
          {item.manifesto}
        </Text>
      </View>

      {item.status === 'PENDING' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: COLORS.pending + '10',
            borderRadius: 6,
          }}
        >
          <Ionicons name="information-circle" size={16} color={COLORS.pending} />
          <Text
            style={{
              fontSize: 11,
              color: COLORS.pending,
              marginLeft: 6,
              flex: 1,
            }}
          >
            Awaiting moderator review (2 approvals needed)
          </Text>
        </View>
      )}

      {item.status === 'APPROVED' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: COLORS.approved + '10',
            borderRadius: 6,
          }}
        >
          <Ionicons name="checkmark-circle" size={16} color={COLORS.approved} />
          <Text
            style={{
              fontSize: 11,
              color: COLORS.approved,
              marginLeft: 6,
              flex: 1,
            }}
          >
            Application approved! You're now a candidate
          </Text>
        </View>
      )}

      {item.status === 'REJECTED' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: COLORS.rejected + '10',
            borderRadius: 6,
          }}
        >
          <Ionicons name="close-circle" size={16} color={COLORS.rejected} />
          <Text
            style={{
              fontSize: 11,
              color: COLORS.rejected,
              marginLeft: 6,
              flex: 1,
            }}
          >
            Application rejected by moderators
          </Text>
        </View>
      )}
    </View>
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
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={COLORS.textLight}
            />
            <Text
              style={{
                fontSize: 18,
                color: COLORS.textSecondary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No applications yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textLight,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Apply for available positions to see them here
            </Text>
          </View>
        }
      />
    </View>
  );
}
