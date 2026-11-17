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
import { Order } from '../types';

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
          placeholder="Search Octopizza menu..."
          placeholderTextColor="#71717A"
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
            const isSelected = selectedCat === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.catPill, isSelected && styles.catPillActive]}
                onPress={() => setSelectedCat(c.id)}
              >
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>
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
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#FACC15" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {!isConnected ? 'Not Connected to Desktop Host' : 'No Items Found'}
            </Text>
            <Text style={styles.emptySub}>
              {!isConnected
                ? 'Go to Wi-Fi Sync tab to connect to your Desktop POS Terminal.'
                : 'Try searching for pizza, zinger, or pasta.'}
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
          <Text style={styles.floatingCartText}>View Order Cart</Text>
          <Text style={styles.floatingTotal}>Rs. {total.toFixed(0)}</Text>
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
    backgroundColor: '#0A0A0A',
  },
  searchBar: {
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
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
    color: '#A1A1AA',
    fontSize: 14,
  },
  categoryContainer: {
    backgroundColor: '#101010',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  catPill: {
    backgroundColor: '#181818',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  catPillActive: {
    backgroundColor: '#FACC15',
    borderColor: '#FACC15',
  },
  catText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '700',
  },
  catTextActive: {
    color: '#000000',
    fontWeight: '900',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySub: {
    color: '#71717A',
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
    backgroundColor: '#FACC15',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: '#000000',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FACC15',
    fontWeight: '900',
    fontSize: 12,
  },
  floatingCartText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  floatingTotal: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
    fontFamily: 'monospace',
  },
});
