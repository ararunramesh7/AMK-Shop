// App-wide constants
export const ORDER_STATUSES = {
  placed: { key: 'placed', label: 'Order Placed', color: '#1565C0', step: 1 },
  confirmed: { key: 'confirmed', label: 'Order Confirmed', color: '#FF8F00', step: 2 },
  preparing: { key: 'preparing', label: 'Preparing', color: '#E65100', step: 3 },
  out_for_delivery: { key: 'out_for_delivery', label: 'Out for Delivery', color: '#7B1FA2', step: 4 },
  delivered: { key: 'delivered', label: 'Delivered', color: '#2E7D32', step: 5 },
  cancelled: { key: 'cancelled', label: 'Cancelled', color: '#C62828', step: -1 },
};

export const PAYMENT_METHODS = {
  cod: { key: 'cod', label: 'Cash on Delivery', icon: 'Banknote' },
};

export const STOCK_STATUS = {
  available: { label: 'Available', color: '#2E7D32', bg: '#E8F5E9' },
  low_stock: { label: 'Low Stock', color: '#F57F17', bg: '#FFF8E1' },
  out_of_stock: { label: 'Out of Stock', color: '#C62828', bg: '#FFEBEE' },
  unavailable: { label: 'Unavailable', color: '#757575', bg: '#F5F5F5' },
};

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

export const DEFAULT_SHOP_SETTINGS = {
  shop_name: 'Aruna Muruku Kadai',
  free_delivery_km: 2,
  per_km_charge: 15,
  low_stock_threshold: 5,
  cancellation_window_minutes: 30,
  currency_symbol: '₹',
};
