import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useServer } from '../context/ServerContext';
import { Order } from '../types';

export const DashboardScreen: React.FC = () => {
  const { salesSummary, orders, isConnected, refreshOrders } = useServer();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setIsRefreshing(false);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isMobile = item.source === 'MOBILE';
    const dateStr = new Date(item.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.invoiceNo}>{item.invoice_no}</Text>
            <Text style={styles.orderTime}>{dateStr}</Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.sourceBadge, isMobile ? styles.mobileBadge : styles.desktopBadge]}>
              <Text style={[styles.sourceText, isMobile ? styles.mobileText : styles.desktopText]}>
                {item.source}
              </Text>
            </View>

            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{item.payment_method}</Text>
            </View>
          </View>
        </View>

        <View style={styles.orderBottom}>
          <Text style={styles.itemCount}>
            {item.items?.reduce((s, i) => s + i.qty, 0) || 0} items
          </Text>
          <Text style={styles.orderTotal}>Rs. {item.total.toFixed(0)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Live sync pulse banner */}
      <View style={styles.liveBanner}>
        <View style={[styles.liveDot, isConnected && styles.liveDotActive]} />
        <Text style={styles.liveBannerText}>
          {isConnected ? 'LIVE LOCAL WI-FI WEBSOCKET SYNC' : 'OFFLINE / NOT CONNECTED'}
        </Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Today's Sales</Text>
          <Text style={styles.kpiValue}>
            Rs. {(salesSummary?.totalRevenue || 0).toFixed(0)}
          </Text>
          <Text style={styles.kpiSub}>
            Avg: Rs. {(salesSummary?.averageOrderValue || 0).toFixed(0)}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Bills</Text>
          <Text style={[styles.kpiValue, { color: '#FFFFFF' }]}>
            {salesSummary?.orderCount || 0}
          </Text>
          <Text style={styles.kpiSub}>
            📱 {salesSummary?.mobileOrders || 0} Mobile / 🖥️ {salesSummary?.desktopOrders || 0} POS
          </Text>
        </View>
      </View>

      {/* Payment breakdown pill row */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>💵 Cash:</Text>
          <Text style={styles.breakdownVal}>
            Rs. {(salesSummary?.cashRevenue || 0).toFixed(0)}
          </Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>💳 Card:</Text>
          <Text style={styles.breakdownVal}>
            Rs. {(salesSummary?.cardRevenue || 0).toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Recent Orders List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Real-Time Order Feed</Text>
        <Text style={styles.listSub}>{orders.length} orders logged</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#FACC15" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders recorded yet today.</Text>
            <Text style={styles.emptySub}>
              Orders placed from Desktop POS or Mobile will appear here in real time.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  liveBanner: {
    backgroundColor: '#121212',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#71717A',
    marginRight: 8,
  },
  liveDotActive: {
    backgroundColor: '#FACC15',
  },
  liveBannerText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kpiContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262626',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FACC15',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: '#71717A',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#A1A1AA',
    marginRight: 6,
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  listSub: {
    fontSize: 11,
    color: '#71717A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#262626',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceNo: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  orderTime: {
    fontSize: 10,
    color: '#71717A',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  desktopBadge: {
    backgroundColor: '#262626',
  },
  mobileBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
  },
  sourceText: {
    fontSize: 9,
    fontWeight: '900',
  },
  desktopText: {
    color: '#FFFFFF',
  },
  mobileText: {
    color: '#FACC15',
  },
  methodBadge: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodText: {
    color: '#A1A1AA',
    fontSize: 9,
    fontWeight: '700',
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#262626',
    paddingTop: 6,
  },
  itemCount: {
    fontSize: 11,
    color: '#A1A1AA',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FACC15',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
