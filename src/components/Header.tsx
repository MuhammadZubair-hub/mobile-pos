import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useServer } from '../context/ServerContext';

interface HeaderProps {
  activeTab: 'pos' | 'dashboard' | 'connect';
  setActiveTab: (tab: 'pos' | 'dashboard' | 'connect') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { isConnected, serverName, serverIp } = useServer();

  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>{serverName || 'Mobile POS'}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isConnected ? '#10B981' : '#F59E0B' },
              ]}
            />
            <Text style={styles.subtitle}>
              {isConnected ? `Synced to ${serverIp}:5000` : 'Not Connected'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.connectBadge, isConnected ? styles.connectedBadge : styles.disconnectedBadge]}
          onPress={() => setActiveTab('connect')}
        >
          <Text style={[styles.connectBadgeText, isConnected ? styles.connectedText : styles.disconnectedText]}>
            {isConnected ? 'Wi-Fi: Connected' : 'Connect POS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pos' && styles.activeTab]}
          onPress={() => setActiveTab('pos')}
        >
          <Text style={[styles.tabText, activeTab === 'pos' && styles.activeTabText]}>
            Catalog / Sale
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Live Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'connect' && styles.activeTab]}
          onPress={() => setActiveTab('connect')}
        >
          <Text style={[styles.tabText, activeTab === 'connect' && styles.activeTabText]}>
            Wi-Fi Setup
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  connectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  connectedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  disconnectedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  connectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  connectedText: {
    color: '#10B981',
  },
  disconnectedText: {
    color: '#F59E0B',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#1E293B',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#3B82F6',
  },
});
