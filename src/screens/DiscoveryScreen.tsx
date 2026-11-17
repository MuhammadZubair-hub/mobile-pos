import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useServer } from '../context/ServerContext';

export const DiscoveryScreen: React.FC = () => {
  const {
    serverIp,
    serverPort,
    pairingPin,
    serverName,
    isConnected,
    isConnecting,
    discoveredServers,
    error,
    connectToServer,
    disconnectServer,
  } = useServer();

  const [inputIp, setInputIp] = useState(serverIp || '192.168.1.');
  const [inputPort, setInputPort] = useState(serverPort ? serverPort.toString() : '5000');
  const [inputPin, setInputPin] = useState(pairingPin || '1234');

  const handleManualConnect = async () => {
    if (!inputIp.trim()) {
      Alert.alert('Missing IP', 'Please enter the Desktop POS Host LAN IP address.');
      return;
    }
    const port = parseInt(inputPort, 10) || 5000;
    const pin = inputPin.trim() || '1234';

    const success = await connectToServer(inputIp.trim(), port, pin);
    if (!success) {
      Alert.alert('Connection Failed', error || 'Could not connect to Desktop POS. Make sure both devices are on the same Wi-Fi network.');
    }
  };

  const handleSelectDiscovered = (hostIp: string, port: number) => {
    setInputIp(hostIp);
    setInputPort(port.toString());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Wi-Fi Desktop POS Connect</Text>
        <Text style={styles.subtitle}>
          Auto-discover your Desktop Host or enter its local IP address manually.
        </Text>
      </View>

      {/* Connected Status Card */}
      {isConnected ? (
        <View style={styles.connectedCard}>
          <View style={styles.connectedHeader}>
            <View style={styles.greenDot} />
            <Text style={styles.connectedTitle}>Connected to POS Host</Text>
          </View>
          <Text style={styles.connectedServerName}>{serverName}</Text>
          <Text style={styles.connectedHost}>
            {serverIp}:{serverPort} (UDP & WebSocket Sync Active)
          </Text>

          <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectServer}>
            <Text style={styles.disconnectBtnText}>Disconnect Host</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Auto Discovered Servers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📡 UDP Auto-Discovery (Port 5001)</Text>
          <View style={styles.listeningBadge}>
            <Text style={styles.listeningText}>Scanning Wi-Fi...</Text>
          </View>
        </View>

        {discoveredServers.length === 0 ? (
          <View style={styles.noServersBox}>
            <Text style={styles.noServersText}>
              Listening for beacons from desktop host...
            </Text>
            <Text style={styles.noServersSub}>
              Ensure Desktop POS is open and your phone is on the same local Wi-Fi router.
            </Text>
          </View>
        ) : (
          discoveredServers.map((server, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.serverItem}
              onPress={() => handleSelectDiscovered(server.hostIp, server.port)}
            >
              <View>
                <Text style={styles.serverName}>{server.name}</Text>
                <Text style={styles.serverIp}>
                  {server.hostIp}:{server.port}
                </Text>
              </View>
              <View style={styles.selectBadge}>
                <Text style={styles.selectBadgeText}>Select Host</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Manual Connection Fallback Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Manual Connection Fallback</Text>
        <Text style={styles.sectionSub}>
          If UDP is blocked by your router's AP isolation, type the Desktop IP shown on your POS screen:
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Desktop Host Local LAN IP</Text>
          <TextInput
            style={styles.input}
            value={inputIp}
            onChangeText={setInputIp}
            placeholder="192.168.1.15"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>TCP Port</Text>
            <TextInput
              style={styles.input}
              value={inputPort}
              onChangeText={setInputPort}
              placeholder="5000"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Pairing PIN (API Key)</Text>
            <TextInput
              style={styles.input}
              value={inputPin}
              onChangeText={setInputPin}
              placeholder="1234"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

        <TouchableOpacity
          style={[styles.connectBtn, isConnecting && styles.connectBtnDisabled]}
          disabled={isConnecting}
          onPress={handleManualConnect}
        >
          {isConnecting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.connectBtnText}>
              {isConnected ? 'Re-Verify Connection' : 'Pair & Connect over Wi-Fi'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  connectedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  connectedTitle: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  connectedServerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  connectedHost: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  disconnectBtn: {
    marginTop: 12,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  disconnectBtnText: {
    color: '#F87171',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  sectionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 14,
  },
  listeningBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  listeningText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '600',
  },
  noServersBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  noServersText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  noServersSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  serverItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  serverName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  serverIp: {
    fontSize: 12,
    color: '#60A5FA',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  selectBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginBottom: 10,
  },
  connectBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  connectBtnDisabled: {
    backgroundColor: '#334155',
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
