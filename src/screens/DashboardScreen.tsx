import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
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
          {isConnected ? 'LIVE WEBSOCKET FEED (REAL-TIME SYNC)' : 'OFFLINE / DISCONNECTED'}
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
          <Text style={styles.kpiLabel}>Total Orders</Text>
          <Text style={[styles.kpiValue, { color: '#60A5FA' }]}>
            {salesSummary?.orderCount || 0}
          </Text>
          <Text style={styles.kpiSub}>
            📱 {salesSummary?.mobileOrders || 0} Mobile / 🖥️ {salesSummary?.desktopOrders || 0} PC
          </Text>
        </View>
      </View>

      {/* Payment breakdown pill row */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>💵 Cash Sales:</Text>
          <Text style={styles.breakdownVal}>
            Rs. {(salesSummary?.cashRevenue || 0).toFixed(0)}
          </Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>💳 Card Sales:</Text>
          <Text style={styles.breakdownVal}>
            Rs. {(salesSummary?.cardRevenue || 0).toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Recent Orders List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Live Order Stream</Text>
        <Text style={styles.listSub}>{orders.length} transactions recorded</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions recorded yet today.</Text>
            <Text style={styles.emptySub}>
              Orders placed from Desktop or Mobile will stream in real-time.
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
    backgroundColor: '#0B1120',
  },
  liveBanner: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#64748B',
    marginRight: 8,
  },
  liveDotActive: {
    backgroundColor: '#10B981',
  },
  liveBannerText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  kpiContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34D399',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: '#64748B',
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
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginRight: 6,
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  listSub: {
    fontSize: 11,
    color: '#64748B',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceNo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  orderTime: {
    fontSize: 10,
    color: '#64748B',
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
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  mobileBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  sourceText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  desktopText: {
    color: '#60A5FA',
  },
  mobileText: {
    color: '#22D3EE',
  },
  methodBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: 'bold',
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 6,
  },
  itemCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34D399',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
