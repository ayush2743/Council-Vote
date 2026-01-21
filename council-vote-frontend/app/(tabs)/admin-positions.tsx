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
import { Calendar, Clock, X, Briefcase, User } from 'lucide-react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { adminService } from '../../services/adminService';
import { COLORS } from '../../constants/colors';
import type { Position } from '../../types';

export default function AdminPositionsScreen() {
  const [pendingPositions, setPendingPositions] = useState<Position[]>([]);
  const [approvedPositions, setApprovedPositions] = useState<Position[]>([]);
  const [livePositions, setLivePositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showTab, setShowTab] = useState<'pending' | 'approved' | 'live'>('pending');
  
  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [votingStartDate, setVotingStartDate] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectingDateFor, setSelectingDateFor] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, approvedRes, liveRes] = await Promise.all([
        adminService.getPendingPositions(),
        adminService.getApprovedPositions(),
        adminService.getLivePositions(),
      ]);

      // Handle pending positions
      if (!pendingRes.error && pendingRes.data) {
        const data = pendingRes.data as any;
        const positions = data.positions || data;
        const positionsArray = Array.isArray(positions) ? positions : [];
        setPendingPositions(positionsArray);
      } else {
        if (pendingRes.error) {
          console.error('Pending positions error:', pendingRes.error);
        }
        setPendingPositions([]);
      }

      // Handle approved positions
      if (!approvedRes.error && approvedRes.data) {
        const data = approvedRes.data as any;
        const positions = data.positions || data;
        const positionsArray = Array.isArray(positions) ? positions : [];
        setApprovedPositions(positionsArray);
      } else {
        if (approvedRes.error) {
          console.error('Approved positions error:', approvedRes.error);
        }
        setApprovedPositions([]);
      }

      // Handle live positions
      if (!liveRes.error && liveRes.data) {
        const data = liveRes.data as any;
        const positions = data.positions || data;
        const positionsArray = Array.isArray(positions) ? positions : [];
        setLivePositions(positionsArray);
      } else {
        if (liveRes.error) {
          console.error('Live positions error:', liveRes.error);
        }
        setLivePositions([]);
      }
    } catch (error) {
      console.error('Error loading positions:', error);
      Alert.alert('Error', 'Failed to load positions. Please try again.');
      setPendingPositions([]);
      setApprovedPositions([]);
      setLivePositions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadPositions();
    setIsRefreshing(false);
  };

  const handleApprove = (positionId: string, positionName: string) => {
    Alert.alert(
      'Approve Position',
      `Approve "${positionName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActionLoading(positionId);
            const response = await adminService.approvePosition(positionId);
            setActionLoading(null);

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Position approved!');
              loadPositions();
            }
          },
        },
      ]
    );
  };

  const handleReject = (positionId: string, positionName: string) => {
    Alert.alert(
      'Reject Position',
      `Reject "${positionName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(positionId);
            const response = await adminService.rejectPosition(positionId);
            setActionLoading(null);

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Position rejected!');
              loadPositions();
            }
          },
        },
      ]
    );
  };

  const openScheduleModal = (position: Position) => {
    setSelectedPosition(position);
    setVotingStartDate('');
    setVotingEndDate('');
    setSelectingDateFor(null);
    setShowScheduleModal(true);
  };

  const handleDateSelect = (day: any) => {
    // Set time to 00:00:00 for start date and 23:59:59 for end date
    const dateStr = day.dateString; // Format: YYYY-MM-DD
    
    if (selectingDateFor === 'start') {
      const isoDate = `${dateStr}T00:00:00Z`;
      setVotingStartDate(isoDate);
      setSelectingDateFor(null);
    } else if (selectingDateFor === 'end') {
      const isoDate = `${dateStr}T23:59:59Z`;
      setVotingEndDate(isoDate);
      setSelectingDateFor(null);
    }
  };

  const formatDisplayDate = (isoDateString: string) => {
    if (!isoDateString) return 'Select date';
    const date = new Date(isoDateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSchedule = async () => {
    if (!votingStartDate || !votingEndDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    if (!selectedPosition) return;

    setIsScheduling(true);
    const response = await adminService.scheduleVoting(selectedPosition.id, {
      votingStartDate,
      votingEndDate,
    });
    setIsScheduling(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      Alert.alert('Success', 'Voting schedule set!');
      setShowScheduleModal(false);
      setVotingStartDate('');
      setVotingEndDate('');
      setSelectedPosition(null);
      setSelectingDateFor(null);
      loadPositions();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return COLORS.pending;
      case 'APPROVED':
        return COLORS.approved;
      case 'LIVE':
        return COLORS.live;
      case 'CLOSED':
        return COLORS.closed;
      default:
        return COLORS.textLight;
    }
  };

  const renderPendingPosition = ({ item }: { item: Position }) => {
    const isProcessing = actionLoading === item.id;

    return (
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
            marginBottom: 16,
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

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: COLORS.error,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              opacity: isProcessing ? 0.6 : 1,
            }}
            onPress={() => handleReject(item.id, item.name)}
            disabled={isProcessing}
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
                Reject
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: COLORS.success,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              opacity: isProcessing ? 0.6 : 1,
            }}
            onPress={() => handleApprove(item.id, item.name)}
            disabled={isProcessing}
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
                Approve
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderApprovedPosition = ({ item }: { item: Position }) => (
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
          {item.name}
        </Text>
        <View
          style={{
            backgroundColor: getStatusColor(item.status) + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: getStatusColor(item.status),
              textTransform: 'uppercase',
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
            marginBottom: 4,
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
            {item.candidateCount} candidate{item.candidateCount !== 1 ? 's' : ''} standing
          </Text>
        </View>
      )}

      {item.votingStartDate && item.votingEndDate ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Clock size={14} color={COLORS.success} />
          <Text
            style={{
              fontSize: 12,
              color: COLORS.success,
              marginLeft: 6,
            }}
          >
            Voting: {formatDate(item.votingStartDate)} - {formatDate(item.votingEndDate)}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 10,
            padding: 12,
            alignItems: 'center',
            marginTop: 8,
          }}
          onPress={() => openScheduleModal(item)}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            Set Voting Schedule
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
              showTab === 'pending' ? COLORS.primary : 'transparent',
          }}
          onPress={() => setShowTab('pending')}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: showTab === 'pending' ? COLORS.white : COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Pending ({pendingPositions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            backgroundColor:
              showTab === 'approved' ? COLORS.primary : 'transparent',
          }}
          onPress={() => setShowTab('approved')}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color:
                showTab === 'approved' ? COLORS.white : COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Approved ({approvedPositions.length})
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
          showTab === 'pending' 
            ? pendingPositions 
            : showTab === 'approved' 
            ? approvedPositions 
            : livePositions
        }
        renderItem={
          showTab === 'pending' ? renderPendingPosition : renderApprovedPosition
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

      {/* Schedule Modal */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScheduleModal(false)}
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
              Set Voting Schedule
            </Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
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
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>
                {selectedPosition?.name}
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
                Voting Start Date *
              </Text>
              <TouchableOpacity
                onPress={() => setSelectingDateFor('start')}
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: selectingDateFor === 'start' ? COLORS.primary : COLORS.border,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: votingStartDate ? COLORS.text : COLORS.textLight,
                  }}
                >
                  {formatDisplayDate(votingStartDate)}
                </Text>
                <Calendar size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {votingStartDate && (
                <Text
                  style={{
                    fontSize: 11,
                    color: COLORS.textLight,
                    marginTop: 6,
                  }}
                >
                  Time will be set to 00:00:00 UTC
                </Text>
              )}
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
                Voting End Date *
              </Text>
              <TouchableOpacity
                onPress={() => setSelectingDateFor('end')}
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: selectingDateFor === 'end' ? COLORS.primary : COLORS.border,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: votingEndDate ? COLORS.text : COLORS.textLight,
                  }}
                >
                  {formatDisplayDate(votingEndDate)}
                </Text>
                <Calendar size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {votingEndDate && (
                <Text
                  style={{
                    fontSize: 11,
                    color: COLORS.textLight,
                    marginTop: 6,
                  }}
                >
                  Time will be set to 23:59:59 UTC
                </Text>
              )}
            </View>

            {selectingDateFor && (
              <View
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: COLORS.text,
                    }}
                  >
                    Select {selectingDateFor === 'start' ? 'Start' : 'End'} Date
                  </Text>
                  <TouchableOpacity onPress={() => setSelectingDateFor(null)}>
                    <X size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
                <RNCalendar
                  onDayPress={handleDateSelect}
                  markedDates={{
                    ...(votingStartDate && {
                      [votingStartDate.split('T')[0]]: {
                        selected: selectingDateFor === 'start',
                        selectedColor: COLORS.primary,
                      },
                    }),
                    ...(votingEndDate && {
                      [votingEndDate.split('T')[0]]: {
                        selected: selectingDateFor === 'end',
                        selectedColor: COLORS.primary,
                      },
                    }),
                  }}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    todayTextColor: COLORS.primary,
                    selectedDayBackgroundColor: COLORS.primary,
                    selectedDayTextColor: COLORS.white,
                    arrowColor: COLORS.primary,
                    monthTextColor: COLORS.text,
                    textMonthFontWeight: '600',
                  }}
                />
              </View>
            )}

            <TouchableOpacity
              onPress={handleSchedule}
              disabled={isScheduling}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                opacity: isScheduling ? 0.6 : 1,
              }}
            >
              {isScheduling ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Set Schedule
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
