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
  ScrollView,
} from 'react-native';
import { Calendar, Clock, Vote as VoteIcon, X, CheckCircle, User } from 'lucide-react-native';
import { candidateService, type LivePosition } from '../../services/candidateService';
import { COLORS } from '../../constants/colors';

export default function VoteScreen() {
  const [livePositions, setLivePositions] = useState<LivePosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Voting modal state
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<LivePosition | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    loadLivePositions();
  }, []);

  const loadLivePositions = async () => {
    setIsLoading(true);
    const response = await candidateService.getLivePositions();
    setIsLoading(false);

    if (!response.error && response.data) {
      const positions = (response.data as any).positions || response.data;
      setLivePositions(Array.isArray(positions) ? positions : []);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLivePositions();
    setIsRefreshing(false);
  };

  const openVotingModal = (position: LivePosition) => {
    setSelectedPosition(position);
    setSelectedCandidateId(null);
    setShowVotingModal(true);
  };

  const handleVote = async () => {
    if (!selectedCandidateId) {
      Alert.alert('Error', 'Please select a candidate');
      return;
    }

    if (!selectedPosition) return;

    Alert.alert(
      'Confirm Vote',
      'Are you sure you want to vote for this candidate? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsVoting(true);
            const response = await candidateService.submitVote(selectedCandidateId);
            setIsVoting(false);

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Your vote has been recorded successfully!');
              setShowVotingModal(false);
              setSelectedPosition(null);
              setSelectedCandidateId(null);
              loadLivePositions();
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLivePosition = ({ item }: { item: LivePosition }) => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: item.hasVoted ? COLORS.success : COLORS.primary,
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
          Voting ends: {formatDate(item.votingEndDate)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <User size={14} color={COLORS.textSecondary} />
        <Text
          style={{
            fontSize: 12,
            color: COLORS.textSecondary,
            marginLeft: 6,
          }}
        >
          {item.candidates.length} candidates
        </Text>
      </View>

      {item.hasVoted ? (
        <View
          style={{
            backgroundColor: COLORS.success + '20',
            borderRadius: 10,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: COLORS.success,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            You've Already Voted
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
          onPress={() => openVotingModal(item)}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            Cast Your Vote
          </Text>
        </TouchableOpacity>
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
          Voting
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={livePositions}
        renderItem={renderLivePosition}
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
            <VoteIcon size={64} color={COLORS.textLight} />
            <Text
              style={{
                fontSize: 18,
                color: COLORS.textSecondary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No live positions for voting
            </Text>
          </View>
        }
      />

      {/* Voting Modal */}
      <Modal
        visible={showVotingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVotingModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
              Vote for Candidate
            </Text>
            <TouchableOpacity onPress={() => setShowVotingModal(false)}>
              <X size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
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

            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: COLORS.text,
                marginBottom: 16,
              }}
            >
              Select a Candidate:
            </Text>

            {selectedPosition?.candidates.map((candidate) => (
              <TouchableOpacity
                key={candidate.id}
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor:
                    selectedCandidateId === candidate.id
                      ? COLORS.primary
                      : COLORS.border,
                }}
                onPress={() => setSelectedCandidateId(candidate.id)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor:
                        selectedCandidateId === candidate.id
                          ? COLORS.primary
                          : COLORS.border,
                      backgroundColor:
                        selectedCandidateId === candidate.id
                          ? COLORS.primary
                          : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    {selectedCandidateId === candidate.id && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: COLORS.white,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: COLORS.text,
                      }}
                    >
                      {candidate.user.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.textSecondary,
                      }}
                    >
                      {candidate.user.email}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: COLORS.background,
                    borderRadius: 8,
                    padding: 12,
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
                    Manifesto:
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {candidate.manifesto}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleVote}
              disabled={isVoting || !selectedCandidateId}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginTop: 20,
                opacity: isVoting || !selectedCandidateId ? 0.6 : 1,
              }}
            >
              {isVoting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Submit Vote
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
