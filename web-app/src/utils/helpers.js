// Format price with Indian Rupee symbol
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Format date to readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
};

// Calculate Haversine distance between two coordinates (km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => (deg * Math.PI) / 180;

// Calculate delivery charge based on distance
export const calculateDeliveryCharge = (distanceKm, freeDeliveryKm = 2, perKmCharge = 15) => {
  if (distanceKm <= freeDeliveryKm) return 0;
  const extraKm = Math.ceil(distanceKm - freeDeliveryKm);
  return extraKm * perKmCharge;
};

// Get stock status based on quantity and threshold
export const getStockStatus = (stock, threshold = 5) => {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= threshold) return 'low_stock';
  return 'available';
};

// Validate phone number (Indian format)
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned) || /^91[6-9]\d{9}$/.test(cleaned);
};

// Validate PIN code (Indian 6-digit)
export const validatePincode = (pincode) => {
  return /^\d{6}$/.test(pincode.trim());
};

// Debounce function
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Truncate text
export const truncateText = (text, maxLen = 80) => {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '…';
};

// Generate a unique client-side ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get localized product field
export const getLocalizedField = (item, field, language = 'en') => {
  if (!item) return '';
  if (language === 'en') return item[field] || '';
  const localizedField = `${field}_${language}`;
  return item[localizedField] || item[field] || '';
};
