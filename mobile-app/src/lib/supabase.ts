import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // In a real mobile app, you would use AsyncStorage here for persistence.
    // For this example, we use the default in-memory storage.
    persistSession: true,
    detectSessionInUrl: false,
  },
});
