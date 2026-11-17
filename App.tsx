import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { ServerProvider } from './src/context/ServerContext';
import { CartProvider } from './src/context/CartContext';
import { Header } from './src/components/Header';
import { POSScreen } from './src/screens/POSScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DiscoveryScreen } from './src/screens/DiscoveryScreen';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'dashboard' | 'connect'>('pos');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <View style={styles.content}>
        {activeTab === 'pos' && <POSScreen />}
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'connect' && <DiscoveryScreen />}
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ServerProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </ServerProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
});
