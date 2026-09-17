import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import Colors from '../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const totalItems = useCartStore(state => state.getTotalItems());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('status', 'available').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.8}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}><Text style={{fontSize: 40}}>🍘</Text></View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        {item.weight && <Text style={styles.weight}>{item.weight}</Text>}
        <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fresh & Traditional</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
          <ShoppingCart color="#fff" size={20} />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: Colors.primary },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  cartBtn: { padding: 8, backgroundColor: Colors.primaryDark, borderRadius: 20 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.secondary, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  list: { padding: 8 },
  row: { justifyContent: 'space-between', paddingHorizontal: 8 },
  card: { width: '48%', backgroundColor: Colors.card, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: Colors.primaryLight },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  info: { padding: 12 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  weight: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  price: { fontSize: 16, fontWeight: 'bold', color: Colors.primaryDark },
});
