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
        <Text style={styles.title}>Wi-Fi Desktop Connect</Text>
        <Text style={styles.subtitle}>
          Auto-discover your POS terminal on local Wi-Fi or enter LAN IP manually.
        </Text>
      </View>

      {/* Connected Status Card */}
      {isConnected ? (
        <View style={styles.connectedCard}>
          <View style={styles.connectedHeader}>
            <View style={styles.greenDot} />
            <Text style={styles.connectedTitle}>Connected to POS Host</Text>
          </View>
          <Text style={styles.connectedServerName}>{serverName || "OCTOPIZZA'S Fast Food"}</Text>
          <Text style={styles.connectedHost}>
            {serverIp}:{serverPort} (Real-time UDP & WS Sync)
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
            <Text style={styles.listeningText}>Broadcasting...</Text>
          </View>
        </View>

        {discoveredServers.length === 0 ? (
          <View style={styles.noServersBox}>
            <Text style={styles.noServersText}>
              Listening for beacon packets from desktop host...
            </Text>
            <Text style={styles.noServersSub}>
              Ensure Desktop POS app is open and your phone is on the same local Wi-Fi.
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
        <Text style={styles.sectionTitle}>⚙️ Manual IP Fallback</Text>
        <Text style={styles.sectionSub}>
          If UDP is blocked by your router AP isolation, enter the Desktop IP shown on your POS screen:
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Desktop Host LAN IP</Text>
          <TextInput
            style={styles.input}
            value={inputIp}
            onChangeText={setInputIp}
            placeholder="192.168.1.15"
            placeholderTextColor="#71717A"
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
              placeholderTextColor="#71717A"
              keyboardType="number-pad"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Pairing PIN (Default: 1234)</Text>
            <TextInput
              style={styles.input}
              value={inputPin}
              onChangeText={setInputPin}
              placeholder="1234"
              placeholderTextColor="#71717A"
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
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.connectBtnText}>
              {isConnected ? 'Re-Verify Connection' : 'Connect & Sync with Desktop POS'}
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
    backgroundColor: '#0A0A0A',
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
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 4,
  },
  connectedCard: {
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderWidth: 1,
    borderColor: '#FACC15',
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
    backgroundColor: '#FACC15',
    marginRight: 6,
  },
  connectedTitle: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  connectedServerName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  connectedHost: {
    fontSize: 12,
    color: '#A1A1AA',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  disconnectBtn: {
    marginTop: 12,
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  disconnectBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 12,
  },
  section: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionSub: {
    fontSize: 11,
    color: '#A1A1AA',
    marginBottom: 14,
  },
  listeningBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  listeningText: {
    color: '#FACC15',
    fontSize: 10,
    fontWeight: '800',
  },
  noServersBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  noServersText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  noServersSub: {
    color: '#71717A',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  serverItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  serverName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  serverIp: {
    fontSize: 12,
    color: '#FACC15',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  selectBadge: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  formGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 11,
    color: '#A1A1AA',
    marginBottom: 6,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 10,
  },
  connectBtn: {
    backgroundColor: '#FACC15',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  connectBtnDisabled: {
    backgroundColor: '#262626',
  },
  connectBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
  },
});
