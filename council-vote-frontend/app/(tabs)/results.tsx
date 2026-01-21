import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Trophy, X, Medal, User, TrendingUp } from 'lucide-react-native';
import { candidateService, type PositionResult } from '../../services/candidateService';
import { COLORS } from '../../constants/colors';

export default function ResultsScreen() {
  const [results, setResults] = useState<PositionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<PositionResult | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setIsLoading(true);
    const response = await candidateService.getAllResults();
    setIsLoading(false);

    if (!response.error && response.data) {
      const results = (response.data as any).results || response.data;
      setResults(Array.isArray(results) ? results : []);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadResults();
    setIsRefreshing(false);
  };

  const openDetailModal = (result: PositionResult) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return { icon: Trophy, color: '#FFD700' }; // Gold
    if (index === 1) return { icon: Medal, color: '#C0C0C0' }; // Silver
    if (index === 2) return { icon: Medal, color: '#CD7F32' }; // Bronze
    return null;
  };

  const calculatePercentage = (voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  const renderResultCard = ({ item }: { item: PositionResult }) => {
    const winner = item.candidates[0];
    
    return (
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: COLORS.warning,
        }}
        onPress={() => openDetailModal(item)}
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
            marginBottom: 8,
          }}
        >
          {item.description}
        </Text>

        {item.votingEndDate && (
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textLight,
              marginBottom: 16,
            }}
          >
            Result Date: {formatDate(item.votingEndDate)}
          </Text>
        )}

        {winner && (
          <View
            style={{
              backgroundColor: '#FFD70020',
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Trophy size={20} color="#FFD700" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                  marginBottom: 2,
                }}
              >
                Winner
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: COLORS.text,
                }}
              >
                {winner.user.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                }}
              >
                {winner.voteCount} votes ({calculatePercentage(winner.voteCount, item.totalVotes)}%)
              </Text>
            </View>
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TrendingUp size={14} color={COLORS.textSecondary} />
            <Text
              style={{
                fontSize: 12,
                color: COLORS.textSecondary,
                marginLeft: 6,
              }}
            >
              {item.totalVotes} total votes
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: COLORS.borderLight,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: COLORS.primary,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            Tap to view full results
          </Text>
        </View>
      </TouchableOpacity>
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

      {/* List */}
      <FlatList
        data={results}
        renderItem={renderResultCard}
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
            <Trophy size={64} color={COLORS.textLight} />
            <Text
              style={{
                fontSize: 18,
                color: COLORS.textSecondary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No results published yet
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
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
            <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text, flex: 1 }}>
              Full Results
            </Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
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
              <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 }}>
                {selectedResult?.name}
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 }}>
                {selectedResult?.description}
              </Text>
              
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
                    color: COLORS.textSecondary,
                  }}
                >
                  Total Votes: <Text style={{ fontWeight: '700', color: COLORS.text }}>{selectedResult?.totalVotes}</Text>
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: COLORS.text,
                marginBottom: 16,
              }}
            >
              Candidates Ranking:
            </Text>

            {selectedResult?.candidates.map((candidate, index) => {
              const medalInfo = getMedalIcon(index);
              const percentage = calculatePercentage(
                candidate.voteCount,
                selectedResult.totalVotes
              );

              return (
                <View
                  key={candidate.id}
                  style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: medalInfo ? medalInfo.color : COLORS.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    {medalInfo ? (
                      <medalInfo.icon size={24} color={medalInfo.color} />
                    ) : (
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: COLORS.background,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: COLORS.textSecondary,
                          }}
                        >
                          {index + 1}
                        </Text>
                      </View>
                    )}
                    <View style={{ marginLeft: 12, flex: 1 }}>
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

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        height: 8,
                        backgroundColor: COLORS.background,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: medalInfo ? medalInfo.color : COLORS.primary,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: COLORS.text,
                      }}
                    >
                      {candidate.voteCount} votes
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: COLORS.primary,
                      }}
                    >
                      {percentage}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
