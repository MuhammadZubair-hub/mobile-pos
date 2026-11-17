import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../types';

interface ProductItemProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product, onAdd }) => {
  const isOutOfStock = product.stock_qty <= 0;
  const isLowStock = product.stock_qty > 0 && product.stock_qty <= 10;

  return (
    <View style={styles.card}>
      <View style={styles.infoCol}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryBadge}>
            {product.category_name || 'General'}
          </Text>
          {isOutOfStock ? (
            <Text style={styles.outOfStock}>Out of stock</Text>
          ) : isLowStock ? (
            <Text style={styles.lowStock}>{product.stock_qty} left</Text>
          ) : (
            <Text style={styles.inStock}>Stock: {product.stock_qty}</Text>
          )}
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {product.sku ? <Text style={styles.sku}>SKU: {product.sku}</Text> : null}
      </View>

      <View style={styles.actionCol}>
        <Text style={styles.price}>Rs. {product.price.toFixed(0)}</Text>
        <TouchableOpacity
          style={[styles.addButton, isOutOfStock && styles.addButtonDisabled]}
          disabled={isOutOfStock}
          onPress={() => onAdd(product)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginVertical: 5,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoCol: {
    flex: 1,
    paddingRight: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#60A5FA',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  outOfStock: {
    fontSize: 10,
    color: '#F87171',
    fontWeight: '600',
  },
  lowStock: {
    fontSize: 10,
    color: '#FBBF24',
    fontWeight: '600',
  },
  inStock: {
    fontSize: 10,
    color: '#94A3B8',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
    lineHeight: 18,
  },
  sku: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34D399',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#334155',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
