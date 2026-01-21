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
import { Users, CheckCircle, Clock, Trophy, Megaphone, BarChart3 } from 'lucide-react-native';
import { adminService } from '../../services/adminService';
import { COLORS } from '../../constants/colors';
import type { PositionResult } from '../../types';

export default function AdminResultsScreen() {
  const [results, setResults] = useState<PositionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setIsLoading(true);
    const response = await adminService.getAllResults();
    setIsLoading(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else if (response.data) {
      // Backend returns { results: [...] }
      const results = (response.data as any).results || response.data;
      setResults(Array.isArray(results) ? results : []);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadResults();
    setIsRefreshing(false);
  };

  const handlePublish = (positionId: string, positionName: string, votingEndDate?: string) => {
    // Check if publishing before scheduled end date
    const now = new Date();
    const endDate = votingEndDate ? new Date(votingEndDate) : null;
    const isEarlyPublish = endDate && now < endDate;

    const message = isEarlyPublish
      ? `Publish voting results for "${positionName}"?\n\n⚠️ Warning: Voting is scheduled to end on ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Publishing now will immediately close voting and set the end date to now.\n\nThis action cannot be undone.`
      : `Publish voting results for "${positionName}"? This will make results visible to all users.`;

    Alert.alert(
      'Publish Results',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          style: isEarlyPublish ? 'destructive' : 'default',
          onPress: async () => {
            setPublishingId(positionId);
            const response = await adminService.publishResults({
              positionIds: [positionId],
            });
            setPublishingId(null);

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert(
                'Success', 
                isEarlyPublish 
                  ? 'Results published successfully! Voting has been closed and end date updated to now.' 
                  : 'Results published successfully!'
              );
              loadResults();
            }
          },
        },
      ]
    );
  };

  const getWinner = (result: PositionResult) => {
    if (!result.candidates || result.candidates.length === 0) return null;
    return result.candidates.reduce((max, candidate) =>
      candidate.voteCount > max.voteCount ? candidate : max
    );
  };

  const renderResult = ({ item }: { item: PositionResult }) => {
    const winner = getWinner(item);
    const isPublishing = publishingId === item.id;
    const sortedCandidates = [...(item.candidates || [])].sort(
      (a, b) => b.voteCount - a.voteCount
    );
    
    // Check if voting is still active
    const now = new Date();
    const endDate = item.votingEndDate ? new Date(item.votingEndDate) : null;
    const isVotingActive = endDate && now < endDate && !item.resultsPublished;

    return (
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
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
                fontSize: 20,
            fontWeight: '700',
            color: COLORS.text,
            marginBottom: 4,
          }}
        >
          {item.name}
        </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Users size={14} color={COLORS.textSecondary} />
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  marginLeft: 6,
                }}
              >
                {item.totalVotes} total votes
              </Text>
            </View>
            {item.votingEndDate && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isVotingActive && <Clock size={12} color={COLORS.live} style={{ marginRight: 4 }} />}
                <Text
                  style={{
                    fontSize: 12,
                    color: isVotingActive ? COLORS.live : COLORS.textLight,
                    fontWeight: isVotingActive ? '600' : 'normal',
                  }}
                >
                  {isVotingActive ? 'Voting ends: ' : 'Result Date: '}
                  {new Date(item.votingEndDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>

        <View
          style={{
            backgroundColor: item.resultsPublished
              ? COLORS.success + '20'
              : COLORS.pending + '20',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {item.resultsPublished ? (
            <CheckCircle
              size={14}
              color={COLORS.success}
            />
          ) : (
            <Clock
              size={14}
              color={COLORS.pending}
            />
          )}
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: item.resultsPublished ? COLORS.success : COLORS.pending,
              marginLeft: 4,
              textTransform: 'uppercase',
            }}
          >
            {item.resultsPublished ? 'Published' : 'Unpublished'}
          </Text>
        </View>
        </View>

        {winner && (
          <View
            style={{
              backgroundColor: COLORS.success + '15',
              borderRadius: 10,
              padding: 14,
              marginBottom: 16,
              borderWidth: 2,
              borderColor: COLORS.success,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Trophy size={20} color={COLORS.success} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: COLORS.success,
                  marginLeft: 6,
                  textTransform: 'uppercase',
                }}
              >
                Winner
              </Text>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: COLORS.text,
            marginBottom: 4,
          }}
        >
          {winner.user.name}
        </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: COLORS.success,
              }}
            >
              {winner.voteCount} votes
            </Text>
            {item.totalVotes > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                  marginTop: 4,
                }}
              >
                {((winner.voteCount / item.totalVotes) * 100).toFixed(1)}% of total
                votes
              </Text>
            )}
          </View>
        )}

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: COLORS.borderLight,
            paddingTop: 12,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: COLORS.textSecondary,
              marginBottom: 12,
            }}
          >
            All Candidates
          </Text>

          {sortedCandidates.map((candidate, index) => {
            const percentage =
              item.totalVotes > 0
                ? (candidate.voteCount / item.totalVotes) * 100
                : 0;
            const isWinner = candidate.id === winner?.id;

            return (
              <View
                key={candidate.id}
                style={{
                  marginBottom: 10,
                  padding: 12,
                  backgroundColor: isWinner
                    ? COLORS.success + '08'
                    : COLORS.background,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: COLORS.text,
                        marginRight: 8,
                      }}
                    >
                      #{index + 1}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: isWinner ? '700' : '600',
                        color: COLORS.text,
                        flex: 1,
                      }}
                    >
                      {candidate.user.name}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: isWinner ? COLORS.success : COLORS.primary,
                    }}
                  >
                    {candidate.voteCount}
                  </Text>
                </View>

                <View
                  style={{
                    height: 6,
                    backgroundColor: COLORS.borderLight,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: isWinner ? COLORS.success : COLORS.primary,
                      borderRadius: 3,
                    }}
                  />
                </View>

                <Text
                  style={{
                    fontSize: 11,
                    color: COLORS.textLight,
                    marginTop: 4,
                  }}
                >
                  {percentage.toFixed(1)}%
                </Text>
              </View>
            );
          })}
        </View>

        {!item.resultsPublished && (
          <>
            {isVotingActive && (
              <View
                style={{
                  backgroundColor: COLORS.warning + '20',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: COLORS.warning,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.textSecondary,
                    lineHeight: 18,
                  }}
                >
                  ⚠️ Voting is still active. Publishing now will immediately close voting and update the end date to the current time.
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={{
                backgroundColor: isVotingActive ? COLORS.warning : COLORS.primary,
                borderRadius: 10,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isPublishing ? 0.6 : 1,
              }}
              onPress={() => handlePublish(item.id, item.name, item.votingEndDate)}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Megaphone size={18} color={COLORS.white} />
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 14,
                      fontWeight: '600',
                      marginLeft: 8,
                    }}
                  >
                    {isVotingActive ? 'Publish Early & Close Voting' : 'Publish Results'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
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
          Results
        </Text>
      </View>

      <FlatList
        data={results}
        renderItem={renderResult}
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
            <BarChart3 size={64} color={COLORS.textLight} />
            <Text
              style={{
                fontSize: 18,
                color: COLORS.textSecondary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No results available
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textLight,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Results will appear here after voting ends
            </Text>
          </View>
        }
      />
    </View>
  );
}
