import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { 
  LayoutDashboard, 
  Briefcase, 
  Shield, 
  BarChart3, 
  User,
  FileText,
  Vote,
  Trophy,
  List,
  Users
} from 'lucide-react-native';

export default function TabLayout() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/login" />;

  const isCandidate = user.role === 'CANDIDATE';
  const isModerator = user.role === 'MODERATOR';
  const isAdmin = user.role === 'SUPER_ADMIN';

  // Super Admin Tabs
  if (isAdmin) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.borderLight,
            borderTopWidth: 1,
            height: 90,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="admin-dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-positions"
          options={{
            title: 'Positions',
            tabBarIcon: ({ color, size }) => (
              <Briefcase size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-moderators"
          options={{
            title: 'Moderators',
            tabBarIcon: ({ color, size }) => (
              <Shield size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-results"
          options={{
            title: 'Results',
            tabBarIcon: ({ color, size }) => (
              <BarChart3 size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
        />
        {/* Hide other role tabs */}
        <Tabs.Screen name="positions" options={{ href: null }} />
        <Tabs.Screen name="applications" options={{ href: null }} />
        <Tabs.Screen name="vote" options={{ href: null }} />
        <Tabs.Screen name="results" options={{ href: null }} />
        <Tabs.Screen name="mod-positions" options={{ href: null }} />
        <Tabs.Screen name="mod-candidates" options={{ href: null }} />
        <Tabs.Screen name="dashboard" options={{ href: null }} />
        <Tabs.Screen name="mod-dashboard" options={{ href: null }} />
        <Tabs.Screen name="mod-results" options={{ href: null }} />
      </Tabs>
    );
  }

  // Moderator Tabs
  if (isModerator) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.borderLight,
            borderTopWidth: 1,
            height: 90,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="mod-dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mod-positions"
          options={{
            title: 'Positions',
            tabBarIcon: ({ color, size }) => (
              <Briefcase size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mod-candidates"
          options={{
            title: 'Proposals',
            tabBarIcon: ({ color, size }) => (
              <FileText size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mod-results"
          options={{
            title: 'Results',
            tabBarIcon: ({ color, size }) => (
              <Trophy size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
        />
        {/* Hide other role tabs */}
        <Tabs.Screen name="dashboard" options={{ href: null }} />
        <Tabs.Screen name="positions" options={{ href: null }} />
        <Tabs.Screen name="applications" options={{ href: null }} />
        <Tabs.Screen name="vote" options={{ href: null }} />
        <Tabs.Screen name="results" options={{ href: null }} />
        <Tabs.Screen name="admin-dashboard" options={{ href: null }} />
        <Tabs.Screen name="admin-positions" options={{ href: null }} />
        <Tabs.Screen name="admin-moderators" options={{ href: null }} />
        <Tabs.Screen name="admin-results" options={{ href: null }} />
      </Tabs>
    );
  }

  // Candidate Tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="positions"
        options={{
          title: 'Positions',
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vote"
        options={{
          title: 'Voting',
          tabBarIcon: ({ color, size }) => (
            <Vote size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color, size }) => (
            <Trophy size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      {/* Hide other role tabs */}
      <Tabs.Screen name="applications" options={{ href: null }} />
      <Tabs.Screen name="mod-positions" options={{ href: null }} />
      <Tabs.Screen name="mod-candidates" options={{ href: null }} />
      <Tabs.Screen name="admin-dashboard" options={{ href: null }} />
      <Tabs.Screen name="admin-positions" options={{ href: null }} />
      <Tabs.Screen name="admin-moderators" options={{ href: null }} />
      <Tabs.Screen name="admin-results" options={{ href: null }} />
      <Tabs.Screen name="mod-dashboard" options={{ href: null }} />
      <Tabs.Screen name="mod-results" options={{ href: null }} />
    </Tabs>
  );
}
