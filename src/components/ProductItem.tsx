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
            {product.category_name || 'Fast Food'}
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
          <Text style={[styles.addButtonText, isOutOfStock && styles.addButtonTextDisabled]}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
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
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#FACC15',
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  outOfStock: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
  },
  lowStock: {
    fontSize: 10,
    color: '#FACC15',
    fontWeight: '700',
  },
  inStock: {
    fontSize: 10,
    color: '#71717A',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  sku: {
    fontSize: 10,
    color: '#71717A',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FACC15',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  addButton: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#262626',
  },
  addButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 12,
  },
  addButtonTextDisabled: {
    color: '#71717A',
  },
});
