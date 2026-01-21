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
import { Calendar, Briefcase, X, Plus, User, Clock } from 'lucide-react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { moderatorService } from '../../services/moderatorService';
import { COLORS } from '../../constants/colors';
import type { Position } from '../../types';

export default function ModPositionsScreen() {
  const [createdPositions, setCreatedPositions] = useState<Position[]>([]);
  const [approvedPositions, setApprovedPositions] = useState<Position[]>([]);
  const [livePositions, setLivePositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTab, setShowTab] = useState<'created' | 'approved' | 'live'>('created');
  
  // Create position modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [positionName, setPositionName] = useState('');
  const [positionDescription, setPositionDescription] = useState('');
  const [applicationEndDate, setApplicationEndDate] = useState('');
  const [selectingDate, setSelectingDate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setIsLoading(true);
    const [createdRes, approvedRes, liveRes] = await Promise.all([
      moderatorService.getCreatedPositions(),
      moderatorService.getApprovedPositions(),
      moderatorService.getLivePositions(),
    ]);
    setIsLoading(false);

    if (!createdRes.error && createdRes.data) {
      const positions = (createdRes.data as any).positions || createdRes.data;
      setCreatedPositions(Array.isArray(positions) ? positions : []);
    }

    if (!approvedRes.error && approvedRes.data) {
      const positions = (approvedRes.data as any).positions || approvedRes.data;
      setApprovedPositions(Array.isArray(positions) ? positions : []);
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

  const openCreateModal = () => {
    setPositionName('');
    setPositionDescription('');
    setApplicationEndDate('');
    setSelectingDate(false);
    setShowCreateModal(true);
  };

  const handleDateSelect = (day: any) => {
    const dateStr = day.dateString;
    const isoDate = `${dateStr}T23:59:59Z`;
    setApplicationEndDate(isoDate);
    setSelectingDate(false);
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

  const handleCreatePosition = async () => {
    if (!positionName.trim()) {
      Alert.alert('Error', 'Please enter position name');
      return;
    }

    if (!positionDescription.trim()) {
      Alert.alert('Error', 'Please enter position description');
      return;
    }

    if (!applicationEndDate) {
      Alert.alert('Error', 'Please select application end date');
      return;
    }

    setIsCreating(true);
    const response = await moderatorService.createPosition({
      name: positionName.trim(),
      description: positionDescription.trim(),
      applicationEndDate,
    });
    setIsCreating(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      Alert.alert('Success', 'Position created successfully! Waiting for admin approval.');
      setShowCreateModal(false);
      setPositionName('');
      setPositionDescription('');
      setApplicationEndDate('');
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
      case 'LIVE':
        return COLORS.live;
      case 'CLOSED':
        return COLORS.closed;
      default:
        return COLORS.textLight;
    }
  };

  const renderCreatedPosition = ({ item }: { item: Position }) => (
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
          marginBottom: 8,
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

      {item.createdAt && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Clock size={14} color={COLORS.textLight} />
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textLight,
              marginLeft: 6,
            }}
          >
            Created: {formatDate(item.createdAt)}
          </Text>
        </View>
      )}
    </View>
  );

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

      {item.votingStartDate && item.votingEndDate && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
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
      )}
    </View>
  );

  const renderLivePosition = ({ item }: { item: Position }) => (
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
          Applications ended: {formatDate(item.applicationEndDate)}
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

      {item.votingStartDate && item.votingEndDate && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
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
              showTab === 'created' ? COLORS.primary : 'transparent',
          }}
          onPress={() => setShowTab('created')}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: showTab === 'created' ? COLORS.white : COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Created ({createdPositions.length})
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

      {/* Create Button */}
      {showTab === 'created' && (
        <View
          style={{
            backgroundColor: COLORS.background,
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primaryLight,
              borderRadius: 12,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={openCreateModal}
          >
            <Plus size={20} color={COLORS.white} />
            <Text
              style={{
                color: COLORS.white,
                fontSize: 15,
                fontWeight: '600',
                marginLeft: 8,
              }}
            >
              Create Position
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <FlatList
        data={
          showTab === 'created' 
            ? createdPositions 
            : showTab === 'approved' 
            ? approvedPositions 
            : livePositions
        }
        renderItem={
          showTab === 'created' 
            ? renderCreatedPosition 
            : showTab === 'approved' 
            ? renderApprovedPosition 
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

      {/* Create Position Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
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
              Create Position
            </Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
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
                Position Name *
              </Text>
              <TextInput
                value={positionName}
                onChangeText={setPositionName}
                placeholder="e.g., Student Council President"
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
                Description *
              </Text>
              <TextInput
                value={positionDescription}
                onChangeText={setPositionDescription}
                placeholder="Describe the position responsibilities..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: COLORS.text,
                  minHeight: 120,
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
                Application End Date *
              </Text>
              <TouchableOpacity
                onPress={() => setSelectingDate(true)}
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: selectingDate ? COLORS.primary : COLORS.border,
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
                    color: applicationEndDate ? COLORS.text : COLORS.textLight,
                  }}
                >
                  {formatDisplayDate(applicationEndDate)}
                </Text>
                <Calendar size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {applicationEndDate && (
                <Text
                  style={{
                    fontSize: 11,
                    color: COLORS.textLight,
                    marginTop: 6,
                  }}
                >
                  Applications close at 23:59:59 UTC on this date
                </Text>
              )}
            </View>

            {selectingDate && (
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
                    Select Date
                  </Text>
                  <TouchableOpacity onPress={() => setSelectingDate(false)}>
                    <X size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
                <RNCalendar
                  onDayPress={handleDateSelect}
                  markedDates={{
                    [applicationEndDate.split('T')[0]]: {
                      selected: true,
                      selectedColor: COLORS.primary,
                    },
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
              onPress={handleCreatePosition}
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
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Create Position
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
