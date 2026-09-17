import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Colors from '../../constants/Colors';
import { ORDER_STATUSES } from '../../constants/Statuses';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single();
    if (data) setOrder(data);
    setLoading(false);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!order) return <View style={styles.centered}><Text>Order not found</Text></View>;

  const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.placed;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <View style={[styles.badge, { backgroundColor: `${status.color}20` }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={styles.date}>{new Date(order.created_at).toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.order_items?.map((item: any) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              <Text style={styles.itemQty}>₹{item.unit_price.toFixed(2)} x {item.quantity}</Text>
            </View>
            <Text style={styles.itemTotal}>₹{item.total_price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{order.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Charge</Text>
          <Text style={styles.summaryValue}>{order.delivery_charge === 0 ? 'Free' : `₹${order.delivery_charge.toFixed(2)}`}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.total.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <Text style={styles.addressText}>{order.customer_name}</Text>
        <Text style={styles.addressText}>{order.customer_phone}</Text>
        <Text style={[styles.addressText, {marginTop: 8}]}>{order.delivery_address}</Text>
        <Text style={styles.addressText}>{order.delivery_city} - {order.delivery_pincode}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNumber: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { fontSize: 14, fontWeight: 'bold' },
  date: { fontSize: 14, color: Colors.textSecondary },
  section: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '500', color: Colors.text, marginBottom: 4 },
  itemQty: { fontSize: 14, color: Colors.textSecondary },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 16, color: Colors.textSecondary },
  summaryValue: { fontSize: 16, fontWeight: '500', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primaryDark },
  addressText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
});
