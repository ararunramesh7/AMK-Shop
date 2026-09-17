import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShoppingCart, Plus, Minus } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../store/cartStore';
import Colors from '../../constants/Colors';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { addItem, isInCart, incrementQuantity, decrementQuantity, items } = useCartStore();
  
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) setProduct(data);
    setLoading(false);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!product) return <View style={styles.centered}><Text>Product not found</Text></View>;

  const cartItem = items.find(i => i.id === product.id);
  const inCart = !!cartItem;
  const qty = cartItem?.quantity || 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <ScrollView style={styles.container} bounces={false}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}><Text style={{fontSize: 80}}>🍘</Text></View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
        {product.weight && <Text style={styles.weight}>Weight: {product.weight}</Text>}
        
        <View style={styles.stockBadge}>
          <Text style={[styles.stockText, { color: isOutOfStock ? Colors.error : Colors.success }]}>
            {isOutOfStock ? 'Out of Stock' : `${product.stock} packets available`}
          </Text>
        </View>
        
        <Text style={styles.description}>{product.description}</Text>
        
        <View style={styles.footer}>
          {inCart ? (
            <View style={styles.qtyContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementQuantity(product.id)}>
                <Minus color={Colors.text} size={20} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementQuantity(product.id)} disabled={qty >= product.stock}>
                <Plus color={Colors.text} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, {flex: 1, marginLeft: 16}]} onPress={() => router.push('/cart')}>
                <ShoppingCart color="#fff" size={20} style={{marginRight: 8}} />
                <Text style={styles.btnText}>Go to Cart</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.btn, isOutOfStock && styles.btnDisabled]} 
              onPress={() => addItem(product)}
              disabled={isOutOfStock}
            >
              <ShoppingCart color="#fff" size={20} style={{marginRight: 8}} />
              <Text style={styles.btnText}>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: Colors.primaryLight },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, minHeight: 400 },
  name: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  price: { fontSize: 22, fontWeight: 'bold', color: Colors.primaryDark, marginBottom: 8 },
  weight: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12 },
  stockBadge: { backgroundColor: '#f0f0f0', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  stockText: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 16, lineHeight: 24, color: Colors.text, marginBottom: 30 },
  footer: { marginTop: 'auto', paddingTop: 20 },
  btn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12 },
  btnDisabled: { backgroundColor: Colors.border },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 44, height: 44, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  qtyText: { fontSize: 18, fontWeight: 'bold', width: 40, textAlign: 'center' },
});
