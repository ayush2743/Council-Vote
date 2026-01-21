import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { User, FileText, CheckCircle, XCircle, Calendar } from 'lucide-react-native';
import { moderatorService, type CandidateProposal } from '../../services/moderatorService';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

export default function ModCandidatesScreen() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<CandidateProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setIsLoading(true);
    const response = await moderatorService.getPendingProposals();
    setIsLoading(false);

    if (!response.error && response.data) {
      const proposals = (response.data as any).proposals || response.data;
      setProposals(Array.isArray(proposals) ? proposals : []);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadProposals();
    setIsRefreshing(false);
  };

  const handleApprove = (proposalId: string, candidateName: string) => {
    Alert.alert(
      'Approve Candidate',
      `Approve ${candidateName}? Two moderator approvals are needed for final approval.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActionLoading(proposalId);
            const response = await moderatorService.approveProposal(proposalId);
            setActionLoading(null);

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              const data = response.data as any;
              if (data.approvals >= 2) {
                Alert.alert('Success', 'Candidate approved! Final approval reached.');
              } else {
                Alert.alert('Success', `Approval recorded! ${data.approvals}/2 approvals received.`);
              }
              loadProposals();
            }
          },
        },
      ]
    );
  };

  const handleReject = (proposalId: string, candidateName: string) => {
    Alert.alert(
      'Reject Candidate',
      `Reject ${candidateName}? Two moderator rejections are needed for final rejection.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(proposalId);
            const response = await moderatorService.rejectProposal(proposalId);
            setActionLoading(null);

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              const data = response.data as any;
              if (data.rejections >= 2) {
                Alert.alert('Success', 'Candidate rejected! Final rejection reached.');
              } else {
                Alert.alert('Success', `Rejection recorded! ${data.rejections}/2 rejections received.`);
              }
              loadProposals();
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderProposal = ({ item }: { item: CandidateProposal }) => {
    const isProcessing = actionLoading === item.id;
    const approvals = item.moderatorActions?.filter(a => a.action === 'APPROVE').length || 0;
    const rejections = item.moderatorActions?.filter(a => a.action === 'REJECT').length || 0;
    
    // Check if current moderator has already voted
    const myAction = item.moderatorActions?.find(a => a.moderator.id === user?.id);
    const hasApproved = myAction?.action === 'APPROVE';
    const hasRejected = myAction?.action === 'REJECT';
    const hasVoted = !!myAction;

    return (
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: 
            item.status === 'APPROVED' ? COLORS.approved :
            item.status === 'REJECTED' ? COLORS.error :
            COLORS.pending,
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
                fontSize: 16,
                fontWeight: '700',
                color: COLORS.text,
                marginBottom: 4,
              }}
            >
              {item.position.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <User size={14} color={COLORS.textSecondary} />
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  marginLeft: 6,
                }}
              >
                {item.user.name}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.textLight,
                marginTop: 2,
              }}
            >
              {item.user.email}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {item.status !== 'PENDING' && (
              <View
                style={{
                  backgroundColor: 
                    item.status === 'APPROVED' ? COLORS.approved + '20' : 
                    COLORS.error + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: item.status === 'APPROVED' ? COLORS.approved : COLORS.error,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.status}
                </Text>
              </View>
            )}
            {approvals > 0 && (
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
                    marginLeft: 4,
                  }}
                >
                  {approvals}
                </Text>
              </View>
            )}
            {rejections > 0 && (
              <View
                style={{
                  backgroundColor: COLORS.error + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <XCircle size={12} color={COLORS.error} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: COLORS.error,
                    marginLeft: 4,
                  }}
                >
                  {rejections}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <FileText size={14} color={COLORS.text} />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: COLORS.text,
                marginLeft: 6,
              }}
            >
              Manifesto:
            </Text>
          </View>
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
            marginBottom: 12,
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

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: hasRejected ? COLORS.error + '80' : COLORS.error,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              opacity: isProcessing || hasVoted ? 0.6 : 1,
            }}
            onPress={() => handleReject(item.id, item.user.name)}
            disabled={isProcessing || hasVoted}
          >
            {isProcessing ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {hasRejected ? 'Rejected by You' : 'Reject'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: hasApproved ? COLORS.success + '80' : COLORS.success,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              opacity: isProcessing || hasVoted ? 0.6 : 1,
            }}
            onPress={() => handleApprove(item.id, item.user.name)}
            disabled={isProcessing || hasVoted}
          >
            {isProcessing ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {hasApproved ? 'Approved by You' : 'Approve'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          Proposals
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={proposals}
        renderItem={renderProposal}
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
            <FileText size={64} color={COLORS.textLight} />
            <Text
              style={{
                fontSize: 18,
                color: COLORS.textSecondary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No pending proposals
            </Text>
          </View>
        }
      />
    </View>
  );
}
