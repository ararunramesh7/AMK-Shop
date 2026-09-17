import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, LogOut, Package, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import Colors from '../constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <User size={80} color={Colors.border} />
        <Text style={styles.emptyTitle}>Not Logged In</Text>
        <Text style={styles.emptyDesc}>Sign in to view your profile and orders.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.btnText}>Login / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', onPress: async () => {
          await signOut();
          router.replace('/');
        }, style: 'destructive'
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) || user.email?.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Customer'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.phone}>{profile?.phone || 'No phone number added'}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
          <Package color={Colors.text} size={24} />
          <Text style={styles.menuText}>My Orders</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <LogOut color={Colors.error} size={24} />
          <Text style={[styles.menuText, { color: Colors.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: Colors.text },
  emptyDesc: { fontSize: 16, textAlign: 'center', color: Colors.textSecondary, marginBottom: 24 },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  header: { alignItems: 'center', padding: 32, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  email: { fontSize: 16, color: Colors.textSecondary, marginBottom: 4 },
  phone: { fontSize: 14, color: Colors.textSecondary },
  menu: { backgroundColor: Colors.card, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuText: { fontSize: 16, color: Colors.text, marginLeft: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 56 },
});
