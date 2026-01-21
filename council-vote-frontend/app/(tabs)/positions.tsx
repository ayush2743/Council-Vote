import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Calendar, Briefcase, X, CheckCircle, Clock, XCircle, User } from 'lucide-react-native';
import { candidateService, type Application } from '../../services/candidateService';
import { COLORS } from '../../constants/colors';
import type { Position } from '../../types';

type PositionWithStatus = Position & {
  hasApplied?: boolean;
  applicationStatus?: string | null;
};

export default function PositionsScreen() {
  const [activePositions, setActivePositions] = useState<PositionWithStatus[]>([]);
  const [appliedApplications, setAppliedApplications] = useState<Application[]>([]);
  const [livePositions, setLivePositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTab, setShowTab] = useState<'active' | 'applied' | 'live'>('active');
  
  // Application modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PositionWithStatus | null>(null);
  const [manifesto, setManifesto] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setIsLoading(true);
    const [activeRes, appliedRes, liveRes] = await Promise.all([
      candidateService.getAvailablePositions(),
      candidateService.getMyApplications(),
      candidateService.getLivePositions(),
    ]);
    setIsLoading(false);

    if (!activeRes.error && activeRes.data) {
      const positions = (activeRes.data as any).positions || activeRes.data;
      setActivePositions(Array.isArray(positions) ? positions : []);
    }

    if (!appliedRes.error && appliedRes.data) {
      const applications = (appliedRes.data as any).applications || appliedRes.data;
      setAppliedApplications(Array.isArray(applications) ? applications : []);
    }

    if (!liveRes.error && liveRes.data) {
      const positions = (liveRes.data as any).positions || liveRes.data;
      setLivePositions(Array.isArray(positions) ? positions : []);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadPositions();
    setIsRefreshing(false);
  };

  const openApplicationModal = (position: PositionWithStatus) => {
    setSelectedPosition(position);
    setManifesto('');
    setShowApplicationModal(true);
  };

  const handleApply = async () => {
    if (!manifesto.trim()) {
      Alert.alert('Error', 'Please enter your manifesto');
      return;
    }

    if (manifesto.trim().length < 10) {
      Alert.alert('Error', 'Manifesto must be at least 10 characters long');
      return;
    }

    if (!selectedPosition) return;

    setIsApplying(true);
    const response = await candidateService.applyForPosition(
      selectedPosition.id,
      manifesto.trim()
    );
    setIsApplying(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      Alert.alert('Success', 'Application submitted successfully!');
      setShowApplicationModal(false);
      setManifesto('');
      setSelectedPosition(null);
      loadPositions();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return COLORS.pending;
      case 'APPROVED':
        return COLORS.approved;
      case 'REJECTED':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return Clock;
      case 'APPROVED':
        return CheckCircle;
      case 'REJECTED':
        return XCircle;
      default:
        return Clock;
    }
  };

  const renderActivePosition = ({ item }: { item: PositionWithStatus }) => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: COLORS.text,
          marginBottom: 8,
        }}
      >
        {item.name}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: COLORS.textSecondary,
          marginBottom: 12,
        }}
      >
        {item.description}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Calendar size={14} color={COLORS.textSecondary} />
        <Text
          style={{
            fontSize: 12,
            color: COLORS.textSecondary,
            marginLeft: 6,
          }}
        >
          Applications end: {formatDate(item.applicationEndDate)}
        </Text>
      </View>

      {typeof item.candidateCount !== 'undefined' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <User size={14} color={COLORS.info} />
          <Text
            style={{
              fontSize: 12,
              color: COLORS.info,
              marginLeft: 6,
              fontWeight: '600',
            }}
          >
            {item.candidateCount} candidate{item.candidateCount !== 1 ? 's' : ''} approved
          </Text>
        </View>
      )}

      {item.hasApplied ? (
        <View
          style={{
            backgroundColor: COLORS.info + '20',
            borderRadius: 10,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: COLORS.info,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            Already Applied
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 10,
            padding: 14,
            alignItems: 'center',
          }}
          onPress={() => openApplicationModal(item)}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            Apply Now
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAppliedPosition = ({ item }: { item: Application }) => {
    const StatusIcon = getStatusIcon(item.status);
    
    return (
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
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: COLORS.text,
              flex: 1,
            }}
          >
            {item.position.name}
          </Text>
          <View
            style={{
              backgroundColor: getStatusColor(item.status) + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <StatusIcon size={12} color={getStatusColor(item.status)} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: getStatusColor(item.status),
                textTransform: 'uppercase',
                marginLeft: 4,
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            marginBottom: 12,
          }}
        >
          {item.position.description}
        </Text>

        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: COLORS.text,
              marginBottom: 4,
            }}
          >
            Your Manifesto:
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textSecondary,
            }}
          >
            {item.manifesto}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textSecondary,
              marginLeft: 6,
            }}
          >
            Applied on: {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderLivePosition = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.success,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: COLORS.text,
            flex: 1,
          }}
        >
          {item.name}
        </Text>
        {item.hasVoted && (
          <View
            style={{
              backgroundColor: COLORS.success + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <CheckCircle size={12} color={COLORS.success} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: COLORS.success,
                textTransform: 'uppercase',
                marginLeft: 4,
              }}
            >
              VOTED
            </Text>
          </View>
        )}
      </View>

      <Text
        style={{
          fontSize: 14,
          color: COLORS.textSecondary,
          marginBottom: 12,
        }}
      >
        {item.description}
      </Text>

      {item.votingStartDate && item.votingEndDate && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Clock size={14} color={COLORS.success} />
          <Text
            style={{
              fontSize: 12,
              color: COLORS.success,
              marginLeft: 6,
              fontWeight: '600',
            }}
          >
            Voting: {formatDate(item.votingStartDate)} - {formatDate(item.votingEndDate)}
          </Text>
        </View>
      )}

      {item.candidates && item.candidates.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <User size={14} color={COLORS.info} />
          <Text
            style={{
              fontSize: 12,
              color: COLORS.info,
              marginLeft: 6,
              fontWeight: '600',
            }}
          >
            {item.candidates.length} candidate{item.candidates.length !== 1 ? 's' : ''} standing
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
          Positions
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: COLORS.white,
          padding: 4,
          marginHorizontal: 20,
          marginTop: 16,
          borderRadius: 12,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            backgroundColor:
              showTab === 'active' ? COLORS.primary : 'transparent',
          }}
          onPress={() => setShowTab('active')}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: showTab === 'active' ? COLORS.white : COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Active ({activePositions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            backgroundColor:
              showTab === 'applied' ? COLORS.primary : 'transparent',
          }}
          onPress={() => setShowTab('applied')}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color:
                showTab === 'applied' ? COLORS.white : COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Applied ({appliedApplications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            backgroundColor:
              showTab === 'live' ? COLORS.primary : 'transparent',
          }}
          onPress={() => setShowTab('live')}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color:
                showTab === 'live' ? COLORS.white : COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Live ({livePositions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={
          showTab === 'active' 
            ? activePositions 
            : showTab === 'applied' 
            ? appliedApplications 
            : livePositions
        }
        renderItem={
          showTab === 'active' 
            ? renderActivePosition 
            : showTab === 'applied' 
            ? renderAppliedPosition as any
            : renderLivePosition
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Briefcase size={64} color={COLORS.textLight} />
            <Text
              style={{
                fontSize: 18,
                color: COLORS.textSecondary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No {showTab} positions
            </Text>
          </View>
        }
      />

      {/* Application Modal */}
      <Modal
        visible={showApplicationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowApplicationModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: COLORS.background }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.borderLight,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>
              Apply for Position
            </Text>
            <TouchableOpacity onPress={() => setShowApplicationModal(false)}>
              <X size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 }}>
                {selectedPosition?.name}
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                {selectedPosition?.description}
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
                Your Manifesto *
              </Text>
              <TextInput
                value={manifesto}
                onChangeText={setManifesto}
                placeholder="Explain why you're the best candidate for this position..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: COLORS.text,
                  minHeight: 150,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.textLight,
                  marginTop: 6,
                }}
              >
                Minimum 10 characters required
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleApply}
              disabled={isApplying}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                opacity: isApplying ? 0.6 : 1,
              }}
            >
              {isApplying ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Submit Application
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
