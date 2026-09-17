export const ORDER_STATUSES: Record<string, { label: string; color: string; }> = {
  placed: { label: 'Order Placed', color: '#1565C0' }, // Blue
  confirmed: { label: 'Confirmed', color: '#0277BD' }, // Light Blue
  preparing: { label: 'Preparing', color: '#F57F17' }, // Orange/Yellow
  out_for_delivery: { label: 'Out for Delivery', color: '#6A1B9A' }, // Purple
  delivered: { label: 'Delivered', color: '#2E7D32' }, // Green
  cancelled: { label: 'Cancelled', color: '#C62828' }, // Red
};
