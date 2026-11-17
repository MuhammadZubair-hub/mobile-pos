import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useCart } from '../context/CartContext';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  visible,
  onClose,
  onProceedCheckout,
}) => {
  const { items, updateQty, clearCart, subtotal, taxAmount, total, itemCount } = useCart();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Customer Cart</Text>
              <Text style={styles.subTitle}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in order
              </Text>
            </View>

            <View style={styles.headerActions}>
              {items.length > 0 && (
                <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Items List */}
          <ScrollView style={styles.list}>
            {items.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Cart is currently empty</Text>
                <Text style={styles.emptySubText}>Add menu items to start taking an order.</Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.product.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.itemUnit}>Rs. {item.unitPrice.toFixed(0)} each</Text>
                  </View>

                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.product.id, item.qty - 1)}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyVal}>{item.qty}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.product.id, item.qty + 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.lineTotal}>
                    Rs. {(item.unitPrice * item.qty).toFixed(0)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer Totals & Checkout Button */}
          {items.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>Rs. {subtotal.toFixed(0)}</Text>
              </View>
              {taxAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryVal}>+Rs. {taxAmount.toFixed(0)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalVal}>Rs. {total.toFixed(0)}</Text>
              </View>

              <TouchableOpacity style={styles.checkoutBtn} onPress={onProceedCheckout}>
                <Text style={styles.checkoutBtnText}>Checkout Bill (Rs. {total.toFixed(0)})</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    backgroundColor: '#171717',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearBtn: {
    marginRight: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 16,
    maxHeight: 320,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  itemUnit: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 2,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D2D2D',
  },
  qtyBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qtyVal: {
    width: 26,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lineTotal: {
    width: 70,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '900',
    color: '#FACC15',
    fontFamily: 'monospace',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#262626',
    backgroundColor: '#171717',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  summaryVal: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FACC15',
    fontFamily: 'monospace',
  },
  checkoutBtn: {
    marginTop: 14,
    backgroundColor: '#FACC15',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
});
