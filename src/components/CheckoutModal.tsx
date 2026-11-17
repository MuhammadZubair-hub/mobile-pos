import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useServer } from '../context/ServerContext';
import { Order } from '../types';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { items, subtotal, taxAmount, total, clearCart } = useCart();
  const { submitOrder } = useServer();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [tenderedInput, setTenderedInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const tenderedAmount = paymentMethod === 'CASH' && tenderedInput ? parseFloat(tenderedInput) || 0 : total;
  const changeDue = Math.max(0, tenderedAmount - total);
  const isSufficient = paymentMethod !== 'CASH' || tenderedAmount >= total;

  const handleSubmit = async () => {
    if (!isSufficient) {
      Alert.alert('Insufficient Tender', `Tendered amount must be at least $${total.toFixed(2)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
        paymentMethod,
        discount: 0,
        tax: taxAmount,
      };

      const result = await submitOrder(payload);
      setCompletedOrder(result);
      clearCart();
    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Could not submit order to Desktop Host');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (completedOrder) {
      onSuccess(completedOrder);
      setCompletedOrder(null);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.dialog}>
          {completedOrder ? (
            /* Success Screen */
            <View style={styles.successContainer}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Order Placed!</Text>
              <Text style={styles.invoiceNo}>{completedOrder.invoice_no}</Text>
              <Text style={styles.successSub}>
                Synced to Desktop POS Host via Local Wi-Fi
              </Text>

              <View style={styles.successDetails}>
                <View style={styles.row}>
                  <Text style={styles.detailLabel}>Total Paid:</Text>
                  <Text style={styles.detailValue}>${completedOrder.total.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.detailLabel}>Payment Method:</Text>
                  <Text style={styles.detailValue}>{completedOrder.payment_method}</Text>
                </View>
                {paymentMethod === 'CASH' && (
                  <View style={styles.row}>
                    <Text style={styles.detailLabel}>Change Due:</Text>
                    <Text style={[styles.detailValue, { color: '#34D399' }]}>
                      ${changeDue.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.doneBtn} onPress={handleFinish}>
                <Text style={styles.doneBtnText}>New Mobile Sale</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Checkout Form */
            <View>
              <View style={styles.header}>
                <Text style={styles.title}>Mobile Checkout</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Total Due</Text>
                <Text style={styles.amountVal}>${total.toFixed(2)}</Text>
              </View>

              {/* Payment Method Selector */}
              <View style={styles.methodRow}>
                <TouchableOpacity
                  style={[styles.methodBtn, paymentMethod === 'CASH' && styles.methodBtnActive]}
                  onPress={() => setPaymentMethod('CASH')}
                >
                  <Text style={[styles.methodText, paymentMethod === 'CASH' && styles.methodTextActive]}>
                    💵 Cash
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.methodBtn, paymentMethod === 'CARD' && styles.methodBtnActive]}
                  onPress={() => setPaymentMethod('CARD')}
                >
                  <Text style={[styles.methodText, paymentMethod === 'CARD' && styles.methodTextActive]}>
                    💳 Card
                  </Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'CASH' && (
                <View style={styles.cashBox}>
                  <Text style={styles.inputLabel}>Tendered Cash ($)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder={total.toFixed(2)}
                    placeholderTextColor="#64748B"
                    value={tenderedInput}
                    onChangeText={setTenderedInput}
                  />

                  <View style={styles.changeRow}>
                    <Text style={styles.changeLabel}>Change Due:</Text>
                    <Text style={styles.changeVal}>${changeDue.toFixed(2)}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, (!isSufficient || isSubmitting) && styles.submitBtnDisabled]}
                disabled={!isSufficient || isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Mobile Order</Text>
                )}
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
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  amountBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  amountVal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34D399',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  methodBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  methodText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  methodTextActive: {
    color: '#60A5FA',
  },
  cashBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#FFFFFF',
    padding: 10,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  changeLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  changeVal: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  submitBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  invoiceNo: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#60A5FA',
    marginTop: 4,
  },
  successSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  detailValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
