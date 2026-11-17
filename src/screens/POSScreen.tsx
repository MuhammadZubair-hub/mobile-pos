import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useServer } from '../context/ServerContext';
import { useCart } from '../context/CartContext';
import { ProductItem } from '../components/ProductItem';
import { CartModal } from '../components/CartModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { Product, Order } from '../types';

export const POSScreen: React.FC = () => {
  const { products, categories, isConnected, refreshProducts } = useServer();
  const { addItem, itemCount, total } = useCart();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q));
      const matchCat = selectedCat === null || p.category_id === selectedCat;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCat]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshProducts();
    setIsRefreshing(false);
  };

  const handleCheckoutSuccess = (_order: Order) => {
    setIsCheckoutVisible(false);
    setIsCartVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, SKU or barcode..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearch}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          <TouchableOpacity
            style={[styles.catPill, selectedCat === null && styles.catPillActive]}
            onPress={() => setSelectedCat(null)}
          >
            <Text style={[styles.catText, selectedCat === null && styles.catTextActive]}>
              All ({products.length})
            </Text>
          </TouchableOpacity>

          {categories.map((c) => {
            const count = products.filter((p) => p.category_id === c.id).length;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.catPill, selectedCat === c.id && styles.catPillActive]}
                onPress={() => setSelectedCat(c.id)}
              >
                <Text style={[styles.catText, selectedCat === c.id && styles.catTextActive]}>
                  {c.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductItem product={item} onAdd={(p) => addItem(p, 1)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {!isConnected ? 'Not Connected to Desktop Host' : 'No Products Found'}
            </Text>
            <Text style={styles.emptySub}>
              {!isConnected
                ? 'Go to Wi-Fi Setup tab to connect to your Desktop POS Terminal.'
                : 'Try clearing your search or category filter.'}
            </Text>
          </View>
        }
      />

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => setIsCartVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
          <Text style={styles.floatingCartText}>View Cart & Checkout</Text>
          <Text style={styles.floatingTotal}>${total.toFixed(2)}</Text>
        </TouchableOpacity>
      )}

      {/* Cart Modal */}
      <CartModal
        visible={isCartVisible}
        onClose={() => setIsCartVisible(false)}
        onProceedCheckout={() => {
          setIsCartVisible(false);
          setIsCheckoutVisible(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        visible={isCheckoutVisible}
        onClose={() => setIsCheckoutVisible(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  searchBar: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  clearSearch: {
    position: 'absolute',
    right: 28,
    top: 18,
  },
  clearSearchText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  categoryContainer: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  catPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  catText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 90,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 240,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 12,
  },
  floatingCartText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  floatingTotal: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'monospace',
  },
});
