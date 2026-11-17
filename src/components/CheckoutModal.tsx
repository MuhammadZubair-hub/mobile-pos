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
  const { items, taxAmount, total, clearCart } = useCart();
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
      Alert.alert('Insufficient Cash', `Tendered cash must be at least Rs. ${total.toFixed(0)}`);
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
                  <Text style={styles.detailValue}>Rs. {completedOrder.total.toFixed(0)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.detailLabel}>Payment Method:</Text>
                  <Text style={styles.detailValue}>{completedOrder.payment_method}</Text>
                </View>
                {paymentMethod === 'CASH' && (
                  <View style={styles.row}>
                    <Text style={styles.detailLabel}>Change Due:</Text>
                    <Text style={[styles.detailValue, { color: '#FACC15' }]}>
                      Rs. {changeDue.toFixed(0)}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.doneBtn} onPress={handleFinish}>
                <Text style={styles.doneBtnText}>New Mobile Order</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Checkout Form */
            <View>
              <View style={styles.header}>
                <Text style={styles.title}>Mobile Bill Checkout</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Total Payable</Text>
                <Text style={styles.amountVal}>Rs. {total.toFixed(0)}</Text>
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
                    💳 Card / Machine
                  </Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'CASH' && (
                <View style={styles.cashBox}>
                  <Text style={styles.inputLabel}>Tendered Cash (Rs.)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder={total.toFixed(0)}
                    placeholderTextColor="#71717A"
                    value={tenderedInput}
                    onChangeText={setTenderedInput}
                  />

                  <View style={styles.changeRow}>
                    <Text style={styles.changeLabel}>Change Due:</Text>
                    <Text style={styles.changeVal}>Rs. {changeDue.toFixed(0)}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, (!isSufficient || isSubmitting) && styles.submitBtnDisabled]}
                disabled={!isSufficient || isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Order to POS</Text>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
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
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#A1A1AA',
    fontSize: 16,
  },
  amountBox: {
    backgroundColor: '#181818',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  amountLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  amountVal: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FACC15',
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
    backgroundColor: '#181818',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  methodBtnActive: {
    backgroundColor: '#FACC15',
    borderColor: '#FACC15',
  },
  methodText: {
    color: '#A1A1AA',
    fontWeight: '800',
    fontSize: 14,
  },
  methodTextActive: {
    color: '#000000',
  },
  cashBox: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  inputLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    color: '#FFFFFF',
    padding: 10,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  changeLabel: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  changeVal: {
    color: '#FACC15',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  submitBtn: {
    backgroundColor: '#FACC15',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#262626',
  },
  submitBtnText: {
    color: '#000000',
    fontWeight: '900',
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
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    color: '#000000',
    fontSize: 30,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  invoiceNo: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FACC15',
    fontWeight: 'bold',
    marginTop: 4,
  },
  successSub: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 4,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#262626',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  doneBtn: {
    backgroundColor: '#FACC15',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
  },
});
