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
          <Text style={styles.title}>OCTOPIZZA'S</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isConnected ? '#FACC15' : '#71717A' },
              ]}
            />
            <Text style={styles.subtitle}>
              {isConnected ? `Local Host: ${serverIp}:5000` : 'Not Connected'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.connectBadge, isConnected ? styles.connectedBadge : styles.disconnectedBadge]}
          onPress={() => setActiveTab('connect')}
        >
          <Text style={[styles.connectBadgeText, isConnected ? styles.connectedText : styles.disconnectedText]}>
            {isConnected ? 'Wi-Fi: Connected' : 'Connect Host'}
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
            Menu & Sale
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Live Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'connect' && styles.activeTab]}
          onPress={() => setActiveTab('connect')}
        >
          <Text style={[styles.tabText, activeTab === 'connect' && styles.activeTabText]}>
            Wi-Fi Sync
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
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
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
    color: '#A1A1AA',
    fontFamily: 'monospace',
  },
  connectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  connectedBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  disconnectedBadge: {
    backgroundColor: '#181818',
    borderColor: '#333333',
  },
  connectBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  connectedText: {
    color: '#FACC15',
  },
  disconnectedText: {
    color: '#A1A1AA',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#262626',
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FACC15',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '900',
  },
});
