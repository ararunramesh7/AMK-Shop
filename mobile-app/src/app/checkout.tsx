import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MapPin, Banknote, ChevronRight } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import Colors from '../constants/Colors';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { items, getSubtotal, clearCart } = useCartStore();
  
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [pincode, setPincode] = useState(profile?.pincode || '');
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const deliveryCharge = 0; // Free delivery logic can be placed here
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!address || !city || !pincode) {
      Alert.alert('Missing Info', 'Please fill in all address fields.');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.rpc('place_order', {
        p_customer_id: user.id,
        p_customer_name: profile?.full_name || user.email,
        p_customer_phone: profile?.phone || '',
        p_delivery_address: address,
        p_delivery_city: city,
        p_delivery_pincode: pincode,
        p_distance_km: 3,
        p_items: JSON.stringify(orderItems),
      });

      if (error) throw error;

      clearCart();
      Alert.alert('Success', 'Order placed successfully!', [
        { text: 'OK', onPress: () => router.replace(`/order/${data.order_id}`) }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={address} 
              onChangeText={setAddress} 
              placeholder="House No, Street, Landmark"
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Pincode *</Text>
              <TextInput style={styles.input} value={pincode} onChangeText={setPincode} placeholder="Pincode" keyboardType="numeric" maxLength={6} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Banknote color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <View style={styles.paymentOption}>
            <View style={styles.radioActive} />
            <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map(item => (
            <View key={item.id} style={styles.summaryItem}>
              <Text style={styles.summaryName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.summaryPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charge</Text>
            <Text style={styles.summaryValue}>{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge.toFixed(2)}`}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.btnText}>Place Order (₹{total.toFixed(2)})</Text>
              <ChevronRight color="#fff" size={20} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  section: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginLeft: 8 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 16, color: Colors.text },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: Colors.primaryLight, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  radioActive: { width: 20, height: 20, borderRadius: 10, borderWidth: 6, borderColor: Colors.primary, marginRight: 12 },
  paymentText: { fontSize: 16, fontWeight: '600', color: Colors.primaryDark },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryName: { fontSize: 14, color: Colors.textSecondary },
  summaryPrice: { fontSize: 14, fontWeight: '600', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 16, color: Colors.textSecondary },
  summaryValue: { fontSize: 16, fontWeight: '600', color: Colors.text },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primaryDark },
  footer: { backgroundColor: Colors.card, padding: 20, borderTopWidth: 1, borderTopColor: Colors.border },
  btn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
});
