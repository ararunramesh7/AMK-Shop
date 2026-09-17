import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import Colors from '../constants/Colors';
import { ORDER_STATUSES } from '../constants/Statuses';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      router.replace('/(auth)/login');
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    const status = ORDER_STATUSES[item.status] || ORDER_STATUSES.placed;
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push(`/order/${item.id}`)}
      >
        <View style={styles.header}>
          <Text style={styles.orderNumber}>{item.order_number}</Text>
          <View style={[styles.badge, { backgroundColor: `${status.color}20` }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
          <Text style={styles.total}>₹{item.total.toFixed(2)}</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.items}>Tap to view details</Text>
          <ChevronRight color={Colors.textSecondary} size={20} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{fontSize: 80, marginBottom: 16}}>📋</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptyDesc}>You haven't placed any orders.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/')}>
          <Text style={styles.btnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: 16, color: Colors.textSecondary, marginBottom: 24 },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  list: { padding: 16 },
  card: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNumber: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  details: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  date: { fontSize: 14, color: Colors.textSecondary },
  total: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  items: { fontSize: 14, color: Colors.textSecondary },
});
