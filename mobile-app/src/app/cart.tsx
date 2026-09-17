import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react-native';
import { useCartStore } from '../store/cartStore';
import Colors from '../constants/Colors';

export default function CartScreen() {
  const router = useRouter();
  const { items, incrementQuantity, decrementQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingCartIcon size={80} color={Colors.border} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyDesc}>Looks like you haven't added any traditional snacks yet.</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/')}>
          <Text style={styles.browseBtnText}>Browse Snacks</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}><Text style={{fontSize: 24}}>🍘</Text></View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
        <View style={styles.actions}>
          <View style={styles.qtyContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementQuantity(item.id)}>
              <Minus color={Colors.text} size={16} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementQuantity(item.id)} disabled={item.quantity >= item.stock}>
              <Plus color={Colors.text} size={16} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
            <Trash2 color={Colors.error} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Are you sure?', [{text: 'Cancel'}, {text: 'Clear', onPress: clearCart}])}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <ArrowRight color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Temporary workaround for missing icon in this scope
function ShoppingCartIcon(props: any) {
  return <Text style={{fontSize: props.size, color: props.color}}>🛒</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: Colors.text },
  emptyDesc: { fontSize: 16, textAlign: 'center', color: Colors.textSecondary, marginBottom: 24 },
  browseBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  browseBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  clearText: { color: Colors.error, fontSize: 16 },
  list: { padding: 16 },
  cartItem: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 12, padding: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: Colors.primaryLight },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 8, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600', color: Colors.text },
  price: { fontSize: 16, fontWeight: 'bold', color: Colors.primaryDark },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 32, height: 32, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', borderRadius: 6, borderWidth: 1, borderColor: Colors.border },
  qtyText: { fontSize: 16, fontWeight: 'bold', width: 32, textAlign: 'center' },
  removeBtn: { padding: 4 },
  footer: { backgroundColor: Colors.card, padding: 20, borderTopWidth: 1, borderTopColor: Colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryLabel: { fontSize: 16, color: Colors.textSecondary },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  checkoutBtn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12 },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
});
